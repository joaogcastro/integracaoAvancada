import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  GlowingCircle,
  LoginContainer,
  Card,
  Header,
  Form,
  ShowPasswordButton,
  BottomText,
} from "./styles";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Input from "../../components/input";
import ButtonComponent from "../../components/button";
import { useNavigate } from "react-router-dom";
import { api } from "../../service/api.service";
import { useAuth } from "../../hooks/auth";
import type UserModel from "../../models/userModel";

type UserFormData = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  image_url: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile, signOut } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      id: user?.id || 0,
      name: user?.name || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      image_url: user?.image_url || "",
    },
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    setLoading(true);
    try {
      const response = await api.put("/user", data);
      updateProfile(response.data.user as UserModel);
    } catch (error) {
      console.error("Erro na atualização:", error);
    } finally {
      setLoading(false);
      navigate("/chat"); 
    }
  };

  const handleDeleteProfile = async (id: number) => {
    setLoading(true);
    try {
      await api.delete("/user", {
        data: { id },
      });
      signOut();
    } catch (error) {
      console.error("Erro na exclusao da continha:", error);
    } finally {
      setLoading(false);
      navigate("/");
    }
  };

  return (
    <LoginContainer>
      <GlowingCircle />
      <div style={{ position: "absolute", bottom: 50, right: 30 }}>
        <ButtonComponent
          disabled={loading}
          buttonStyles="delete"
          onClick={() => handleDeleteProfile(user?.id)}
        >
          {loading
            ? "Carregando..."
            : "Excluir Conta cuidao em aqui clico explodiu"}
        </ButtonComponent>
      </div>
      <Card>
        <Header>
          <h3>Editar Perfil</h3>
          <p>Edita ai vagabundo</p>
        </Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="Nome"
            inputStyle="primary"
            {...register("name", { required: "Nome é obrigatório" })}
            error={errors.name?.message}
          />

          <Input
            type="text"
            placeholder="Sobrenome"
            inputStyle="primary"
            {...register("lastName", { required: "Sobrenome é obrigatório" })}
            error={errors.lastName?.message}
          />

          <Input
            type="email"
            placeholder="Email"
            disabled={true}
            inputStyle="primary"
            {...register("email", { required: "Email é obrigatório" })}
            error={errors.email?.message}
          />

          <Input
            type="text"
            placeholder="URL da Imagem"
            inputStyle="primary"
            {...register("image_url", { required: "Imagem é obrigatória" })}
            error={errors.image_url?.message}
          />

          <ButtonComponent
            disabled={loading}
            buttonStyles="primary"
            type="submit"
          >
            {loading ? "Carregando..." : "Editar"}
          </ButtonComponent>
        </Form>
      </Card>
    </LoginContainer>
  );
}
