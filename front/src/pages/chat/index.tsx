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

export interface User {
  id: number;
  name: string;
  lastName?: string;
  image_url?: string;
}

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [conversations, setConversations] = useState<{ [key: number]: MessageModel[] }>({});
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await api.get('/users');
        
        const usersData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.users)
            ? response.data.users
            : [];

        setUsers(usersData.filter((u: User) => u.id !== user?.id));
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        toast.error("Falha ao carregar lista de usuários");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenConversation = async (userId: number) => {
    if (!user?.id) return;
    
    setSelectedUser(userId);
    setIsLoadingMessages(true);
    
    try {
      const response = await api.get(`/get_messages`, {
        params: {
          senderId: user.id,
          receiverId: userId
        }
      });

      const msgs = Array.isArray(response.data.messages) 
        ? response.data.messages 
        : [];
        
      setMessages(msgs);
      setConversations(prev => ({
        ...prev,
        [userId]: msgs
      }));
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
      toast.error("Falha ao carregar mensagens");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUser || !user?.id) return;

    const newMessage: MessageModel = {
      id: Date.now(), // ID temporário até confirmação do servidor
      message: messageText,
      senderId: user.id,
      receiverId: selectedUser,
      created_at: new Date().toISOString(),
    };

    // Otimista UI update
    setMessages(prev => [...prev, newMessage]);
    setMessageText("");
    setIsSending(true);

    try {
      const response = await api.post("/send_message", {
        message: messageText,
        senderId: user.id,
        receiverId: selectedUser,
      });

      // Atualiza com a mensagem confirmada do servidor (caso tenha ID diferente)
      const confirmedMessage = response.data.message || newMessage;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? confirmedMessage : msg
        )
      );

      setConversations(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), confirmedMessage]
      }));
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Falha ao enviar mensagem");
      // Reverte a UI no caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <ChatContainer>
      <Sidebar>
        <ChatListContainer>
          {isLoadingUsers ? (
            <div>Carregando usuários...</div>
          ) : (
            users.map((userItem) => (
              <ChatListItem
                key={userItem.id}
                onClick={() => handleOpenConversation(userItem.id)}
                className={selectedUser === userItem.id ? 'active' : ''}
              >
                <Avatar src={userItem.image_url} />
                <div>
                  <UserName>
                    {userItem.name} {userItem.lastName}
                  </UserName>
                  {conversations[userItem.id]?.[0] && (
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>
                      {conversations[userItem.id][0].message.slice(0, 30)}...
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
        {selectedUser ? (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Avatar src={selectedUserData?.image_url} />
              <UserNameinChat>
                {selectedUserData?.name} {selectedUserData?.lastName}
              </UserNameinChat>
            </div>

            <MessagesScroll>
              {isLoadingMessages ? (
                <div>Carregando mensagens...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    message={msg.message}
                    createdAt={msg.created_at}
                    isOwnMessage={msg.senderId === user?.id}
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
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isSending}
                />
              </div>

              <AnimatedButtonWrapper $isFlying={isSending}>
                <ButtonComponent
                  type="submit"
                  isLoading={isSending}
                  style={{ height: "50px" }}
                  disabled={!messageText.trim()}
                >
                  Enviar
                </ButtonComponent>
              </AnimatedButtonWrapper>
            </MessageInputContainer>
          </>
        ) : (
          <p style={{ color: "white", padding: "20px" }}>
            {isLoadingUsers ? 'Carregando...' : 'Selecione um usuário para conversar'}
          </p>
        )}
      </MainChat>
    </ChatContainer>
  );
}