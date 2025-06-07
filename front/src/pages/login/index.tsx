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
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router-dom";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    try {
      const success = await signIn(data.email, data.password);
      if (success) {
        navigate("/chat");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <GlowingCircle />

      <Card>
        <Header>
          <h3>Bem Vindo</h3>
          <p>Insira seu usuário e sua senha</p>
        </Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            placeholder="Usuário"
            inputStyle="primary"
            {...register("email", { required: "Email é obrigatória" })}
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

          <ButtonComponent
            disabled={loading}
            buttonStyles="primary"
            type="submit"
          >
            {loading ? "Carregando..." : "Entrar"}
          </ButtonComponent>

          <ButtonComponent buttonStyles="text" type="button">
            Esqueci minha senha
          </ButtonComponent>
        </Form>

        <BottomText>
          Não tem uma conta?{" "}
          <button type="button" onClick={() => navigate("/register")}>
            Cadastre-se
          </button>
        </BottomText>
      </Card>
    </LoginContainer>
  );
}
