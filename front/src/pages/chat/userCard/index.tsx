import { useNavigate } from "react-router-dom";
import Avatar from "../../../components/avatar";
import { useAuth } from "../../../hooks/auth";
import { UserName } from "../styles";
import { UserCardContainer, UserInfo } from "./styles";

export default function UserCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePress = () => {
    navigate("/profile");
  };

  return (
    <UserCardContainer onClick={handlePress}>
      <Avatar
        src={user?.image_url}
        alt={user?.name}
        style={{ marginRight: "12px" }}
      />
      <UserInfo>
        <UserName>
          {user?.name} {user?.lastName}
        </UserName>
      </UserInfo>
    </UserCardContainer>
  );
}
