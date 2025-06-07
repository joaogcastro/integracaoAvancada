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

interface RegisterFormInputs {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  image_url: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...postData } = data;
      await api.post("/register", postData);
      navigate("/");
    } catch (error) {
      console.error("Erro no registro:", error);
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <LoginContainer>
      <GlowingCircle />

      <Card>
        <Header>
          <h3>Bem Vindo</h3>
          <p>Insira seus dados para registro</p>
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
            inputStyle="primary"
            {...register("email", { required: "Email é obrigatório" })}
            error={errors.email?.message}
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            inputStyle="primary"
            {...register("password", { required: "Senha é obrigatória" })}
            error={errors.password?.message}
            affix={{
              suffix: (
                <ShowPasswordButton type="button" onClick={toggleShowPassword}>
                  {showPassword ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </ShowPasswordButton>
              ),
            }}
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar Senha"
            inputStyle="primary"
            {...register("confirmPassword", {
              required: "Confirmação de senha é obrigatória",
              validate: (value) =>
                value === password || "As senhas não coincidem",
            })}
            error={errors.confirmPassword?.message}
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
            {loading ? "Carregando..." : "Registrar"}
          </ButtonComponent>
        </Form>
      </Card>
    </LoginContainer>
  );
}
