/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, createContext, useContext, useState } from "react";
import { toast } from "sonner";
import type UserModel from "../models/userModel";
import { api } from "../service/api.service";

interface AuthState {
  user: UserModel;
  token: string;
}

export interface AuthContextData {
  signed: boolean;
  loading: boolean;
  user: UserModel;
  signOut(): void;
  updateProfile(data: UserModel): void;
  signIn(email: string, password: string): Promise<boolean>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

interface authProp {
  children: ReactNode;
}

export const AuthProvider = ({ children }: authProp) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem("integracaoAF/token");
    const user = localStorage.getItem("integracaoAF/user");

    if (user && user !== "undefined" && token) {
      try {
        (api as any).defaults.headers.Authorization = `Bearer ${token}`;
        return { token, user: JSON.parse(user) };
      } catch {
        localStorage.removeItem("integracaoAF/user");
      }
    }

    return {} as AuthState;
  });

  const [loading, setLoading] = useState(false);

  const signOut = () => {
    localStorage.removeItem("integracaoAF/token");
    localStorage.removeItem("integracaoAF/user");

    delete (api as any).defaults.headers.Authorization;
    if (!data?.user || !data?.token) return;
    toast.info("Logout efetuado com sucesso!");
    setData({} as AuthState);
  };

  const updateProfile = (updatedUser: UserModel) => {
    localStorage.setItem("integracaoAF/user", JSON.stringify(updatedUser));
    setData((old) => ({ token: old.token, user: updatedUser }));
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data }: any = await api.post("/login", { email, password });

      const { token, user } = data;
      console.log(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setData({ user, token });

      localStorage.setItem("integracaoAF/token", token);
      localStorage.setItem("integracaoAF/user", JSON.stringify(user));

      toast.success("Login realizado com sucesso!");
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      toast.error("Falha no login verifique dados e tente novamente");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!data.user,
        loading,
        user: data.user,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  return context;
}
