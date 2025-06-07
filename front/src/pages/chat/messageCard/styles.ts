import styled from "styled-components";

export const MessageCardContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  padding: 4px 12px;

  .message-bubble {
    background: ${({ $isOwn }) => (!$isOwn ? "#5D1A7A" : "#333")};
    color: white;
    max-width: 60%;
    padding: 10px 14px;
    border-radius: 20px;
    border-bottom-${({ $isOwn }) => ($isOwn ? "right" : "left")}-radius: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export const MessageText = styled.div`
  ${({ theme }) => theme.font.p.normal};
  word-break: break-word;
`;

export const MessageTime = styled.span`
  ${({ theme }) => theme.font.p.small};
  align-self: flex-end;
  opacity: 0.7;
`;
