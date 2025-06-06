export default interface UserModel {
  id: number;
  name: string;
  lastName: string;
  email: string;
  password?: string;
  image_url: string;
}
