import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/auth";
import Avatar from "../../components/avatar";
import {
  ChatContainer,
  Sidebar,
  ChatListItem,
  MainChat,
  MessageInputContainer,
  MessagesScroll,
  UserName,
  UserNameinChat,
  AnimatedButtonWrapper,
  ChatListContainer,
} from "./styles";
import type { MessageModel } from "../../models/messageModel";
import { api } from "../../service/api.service";
import ButtonComponent from "../../components/button";
import Input from "../../components/input";
import MessageCard from "./messageCard";
import UserCard from "./userCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface User {
  id: number;
  name: string;
  lastName?: string;
  image_url?: string | null;
}

interface Conversation {
  [userId: number]: MessageModel[];
}

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState({
    messages: [] as MessageModel[],
    conversations: {} as Conversation,
    selectedUser: null as number | null,
    messageText: "",
    users: [] as User[],
    isLoading: {
      users: true,
      messages: false,
    },
    isSending: false,
  });

  // Derived state
  const selectedUserData = state.users.find(u => u.id === state.selectedUser);

  // Effects
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, users: true } }));

        const response = await api.get('/users');
        const usersData = parseUsersResponse(response.data);

        setState(prev => ({
          ...prev,
          users: usersData.filter((u: User) => u.id !== user?.id),
          isLoading: { ...prev.isLoading, users: false },
        }));
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        toast.error("Falha ao carregar lista de usuários");
        setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, users: false } }));
      }
    };

    loadUsers();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const parseUsersResponse = (data: any): User[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    return [];
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenConversation = async (userId: number) => {
    if (!user?.id) return;

    setState(prev => ({
      ...prev,
      selectedUser: userId,
      isLoading: { ...prev.isLoading, messages: true },
    }));

    try {
      const response = await api.get(`/get_messages`, {
        params: {
          userIdSend: user.id,
          userIdReceive: userId
        }
      });

      const msgs = Array.isArray(response.data.messages)
        ? response.data.messages.map(validateMessage)
        : [];

      setState(prev => ({
        ...prev,
        messages: msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        conversations: {
          ...prev.conversations,
          [userId]: msgs
        },
        isLoading: { ...prev.isLoading, messages: false },
      }));
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
      toast.error("Falha ao carregar mensagens");
      setState(prev => ({
        ...prev,
        messages: [],
        isLoading: { ...prev.isLoading, messages: false },
      }));
    }
  };

  const validateMessage = (msg: any): MessageModel => ({
    id: msg.id || Date.now(),
    message: msg.message || "",
    userIdSend: msg.userIdSend,
    userIdReceive: msg.userIdReceive,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.messageText.trim() || !state.selectedUser || !user?.id) return;

    const tempMessage: MessageModel = {
      id: Date.now(),
      message: state.messageText,
      userIdSend: user.id,
      userIdReceive: state.selectedUser,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
      messageText: "",
      isSending: true,
    }));

    try {
      const response = await api.post("/send_message", {
        message: state.messageText,
        userIdSend: user.id,
        userIdReceive: state.selectedUser,
      });

      const confirmedMessage = {
        ...tempMessage,
        id: response.data.message?.id || tempMessage.id,
        userIdSend: user.id,
      };

      setState(prev => ({
        ...prev,
        messages: prev.messages
          .map(msg => msg.id === tempMessage.id ? confirmedMessage : msg),
        conversations: {
          ...prev.conversations,
          [state.selectedUser!]: [
            ...(prev.conversations[state.selectedUser!] || []),
            confirmedMessage
          ]
        },
        isSending: false,
      }));
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Falha ao enviar mensagem");
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== tempMessage.id),
        isSending: false,
      }));
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <ChatContainer>
      <Sidebar>
        <ChatListContainer>
          {state.isLoading.users ? (
            <div style={{ color: 'white' }}>Carregando usuários...</div>
          ) : (
            state.users.map((userItem) => (
              <ChatListItem
                key={`user-${userItem.id}`}
                onClick={() => handleOpenConversation(userItem.id)}
                className={state.selectedUser === userItem.id ? 'active' : ''}
              >
                <Avatar src={userItem.image_url ?? undefined} />
                <div>
                  <UserName>
                    {userItem.name} {userItem.lastName}
                  </UserName>
                  {state.conversations[userItem.id]?.[0]?.message && (
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>
                      {state.conversations[userItem.id][0].message.slice(0, 30)}...
                    </p>
                  )}
                </div>
              </ChatListItem>
            ))
          )}
        </ChatListContainer>

        <UserCard />
        <ButtonComponent
          style={{ height: "50px", marginTop: "auto" }}
          onClick={handleLogout}
        >
          Sair
        </ButtonComponent>
      </Sidebar>

      <MainChat>
        {state.selectedUser ? (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Avatar src={selectedUserData?.image_url ?? undefined} />
              <UserNameinChat style={{ color: "white" }}>
                {selectedUserData?.name} {selectedUserData?.lastName}
              </UserNameinChat>
            </div>

            <MessagesScroll>
              {state.isLoading.messages ? (
                <div>Carregando mensagens...</div>
              ) : state.messages.length > 0 ? (
                state.messages.map((msg) => (
                  <MessageCard
                    key={`msg-${msg.id}`}
                    message={msg.message}
                    isOwnMessage={msg.userIdSend === user?.id}
                  />
                ))
              ) : (
                <p style={{ color: "white", padding: "20px" }}>
                  Nenhuma mensagem encontrada. Inicie a conversa!
                </p>
              )}
              <div ref={bottomRef} />
            </MessagesScroll>

            <MessageInputContainer onSubmit={handleSendMessage}>
              <div style={{ flex: 1 }}>
                <Input
                  value={state.messageText}
                  onChange={(e) => setState(prev => ({ ...prev, messageText: e.target.value }))}
                  placeholder="Digite sua mensagem..."
                  disabled={state.isSending}
                />
              </div>

              <AnimatedButtonWrapper $isFlying={state.isSending}>
                <ButtonComponent
                  type="submit"
                  isLoading={state.isSending}
                  style={{ height: "50px" }}
                  disabled={!state.messageText.trim()}
                >
                  Enviar
                </ButtonComponent>
              </AnimatedButtonWrapper>
            </MessageInputContainer>
          </>
        ) : (
          <p style={{ color: "white", padding: "20px" }}>
            {state.isLoading.users ? 'Carregando...' : 'Selecione um usuário para conversar'}
          </p>
        )}
      </MainChat>
    </ChatContainer>
  );
}