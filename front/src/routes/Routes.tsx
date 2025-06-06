import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login";
import ChatPage from "../pages/chat";
import RegisterPage from "../pages/register";
import ProfilePage from "../pages/profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default AppRoutes;
