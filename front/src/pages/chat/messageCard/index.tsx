import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { MessageCardContainer, MessageText, MessageTime } from "./styles";

interface MessageCardProps {
  message: string;
  createdAt: string;
  isOwnMessage: boolean;
}

export default function MessageCard({
  message,
  createdAt,
  isOwnMessage,
}: MessageCardProps) {
  const formattedTime = format(new Date(createdAt), "HH:mm", {
    locale: ptBR,
  });

  return (
    <MessageCardContainer $isOwn={isOwnMessage}>
      <div className="message-bubble">
        <MessageText>{message}</MessageText>
        <MessageTime>{formattedTime}</MessageTime>
      </div>
    </MessageCardContainer>
  );
}
