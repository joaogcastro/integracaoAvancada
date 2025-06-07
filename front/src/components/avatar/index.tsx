import type { ImgHTMLAttributes } from "react";
import styled from "styled-components";

export const blankAvatar =
  "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

const AvatarContainer = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 99px;
  object-fit: cover;
`;

interface avatarProps extends ImgHTMLAttributes<HTMLImageElement> {}

const Avatar = ({ src, ...props }: avatarProps) => {
  return <AvatarContainer {...props} src={src ? `${src}` : blankAvatar} />;
};

export default Avatar;
