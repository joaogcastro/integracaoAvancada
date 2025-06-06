export interface MessageModel {
  id: number;
  message: string;
  roomId: number;
  userIdSend: number;
  created_at: string;
}
