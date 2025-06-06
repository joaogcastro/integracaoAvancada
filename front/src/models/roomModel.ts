import type UserModel from "./userModel";

export default interface RoomModel {
  id: number;
  name: string;
  participants: UserModel[];
}
