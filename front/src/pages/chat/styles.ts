import styled, { keyframes, css } from "styled-components";

export const ChatContainer = styled.section`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom, #120513, #424242);
`;

export const Sidebar = styled.aside`
  width: 30%;
  max-width: 350px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #120513, #424242);
  padding: 20px;
  border-right: 1px solid rgb(72, 6, 77);
  overflow: hidden;
`;

export const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

// Interface para as props do ChatListItem
interface ChatListItemProps {
  $isActive?: boolean;
}

export const ChatListItem = styled.button<ChatListItemProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-align: left;
  transition: background 0.2s;
  background-color: ${({ $isActive }) => $isActive ? 'rgba(72, 6, 77, 0.5)' : 'transparent'};

  &:hover {
    background-color: ${({ $isActive }) => $isActive ? 'rgba(72, 6, 77, 0.7)' : '#2a2a2a'};
    cursor: pointer;
  }

  &:active {
    background-color: rgba(72, 6, 77, 0.9);
  }
`;

export const UserName = styled.span`
  ${({ theme }) => theme.font.h4};
  word-break: break-word;
`;

export const UserNameinChat = styled.span`
  ${({ theme }) => theme.font.h3};
  word-break: break-word;
`;

export const MainChat = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

export const MessageInputContainer = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgb(72, 6, 77);
  margin-top: auto;
`;

export const MessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const flyAndSpin = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-200px) rotate(720deg);
    opacity: 0;
  }
`;

export const AnimatedButtonWrapper = styled.div<{ $isFlying: boolean }>`
  display: inline-block;
  ${({ $isFlying }) =>
    $isFlying &&
    css`
      animation: ${flyAndSpin} 2s forwards;
    `}
`;