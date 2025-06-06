import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/auth";
import type RoomModel from "../../models/roomModel";
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

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenRoom = async (room: RoomModel) => {
    setSelectedRoom(room);
    try {
      const response = await api.get(`/get_messages?roomId=${room.id}`);
      setMessages(
        Array.isArray(response.data.messages) ? response.data.messages : []
      );
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedRoom || !user?.id) return;

    const newMessage: MessageModel = {
      id: Date.now(),
      message: messageText,
      userIdSend: user.id,
      roomId: selectedRoom.id,
      created_at: new Date().toISOString(),
    };

    try {
      setIsSending(true);

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");

      await api.post("/send_message", {
        message: messageText,
        userIdSend: user.id,
        roomId: selectedRoom.id,
      });
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
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
          {user?.rooms?.map((room) => (
            <ChatListItem key={room.id} onClick={() => handleOpenRoom(room)}>
              <Avatar src={room.participants[0]?.image_url} />
              <div>
                <UserName>
                  {room.participants[0]?.name} {room.participants[0]?.lastName}
                </UserName>
              </div>
            </ChatListItem>
          ))}
        </ChatListContainer>

        <UserCard />
        <ButtonComponent
          isLoading={isSending}
          style={{ height: "50px" }}
          onClick={handleLogout}
        >
          sair
        </ButtonComponent>
      </Sidebar>

      <MainChat>
        {selectedRoom ? (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Avatar src={selectedRoom?.participants[0]?.image_url} />
              <UserNameinChat style={{ color: "white", padding: "12px" }}>
                {selectedRoom.participants[0]?.name}{" "}
                {selectedRoom.participants[0]?.lastName}
              </UserNameinChat>
            </div>

            <MessagesScroll>
              {messages.map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg.message}
                  createdAt={msg.created_at}
                  isOwnMessage={msg.userIdSend === user?.id}
                />
              ))}
              <div ref={bottomRef} />
            </MessagesScroll>

            <MessageInputContainer onSubmit={handleSendMessage}>
              <div style={{ flex: 1 }}>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                />
              </div>

              <AnimatedButtonWrapper $isFlying={isSending}>
                <ButtonComponent
                  type="submit"
                  isLoading={isSending}
                  style={{ height: "50px" }}
                >
                  Enviar
                </ButtonComponent>
              </AnimatedButtonWrapper>
            </MessageInputContainer>
          </>
        ) : (
          <p style={{ color: "white", padding: "20px" }}>
            Selecione um chat na lateral
          </p>
        )}
      </MainChat>
    </ChatContainer>
  );
}
