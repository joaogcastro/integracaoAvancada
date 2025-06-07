import { MessageCardContainer, MessageText, } from "./styles";

interface MessageCardProps {
  message: string;
  isOwnMessage: boolean;
}

export default function MessageCard({
  message,
  isOwnMessage,
}: MessageCardProps) {

  return (
    <MessageCardContainer $isOwn={isOwnMessage}>
      <div className="message-bubble">
        <MessageText>{message}</MessageText>
      </div>
    </MessageCardContainer>
  );
}