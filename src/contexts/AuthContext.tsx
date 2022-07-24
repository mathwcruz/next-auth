import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";

import { api } from "../services/apiClient";

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel; // declarando a variável fora do escopo pois deve-se usar ela apenas no client ()browser e não no lado do server

export const signOut = () => {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  authChannel.postMessage("signOut"); // "enviado" uma mensagem a todos as abas que consomem este canal

  Router.push("/");
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth"); // criando uma canal para compartilhar informações entre várias abas com o mesmo canal de origem

    authChannel.onmessage = (message) => {
      switch (message?.data) {
        case "signOut":
          signOut();
          authChannel.close();
          break;
        case "signIn":
          window.location.replace("http://localhost:3000/dashboard");
          break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response?.data;

          setUser({
            email,
            permissions,
            roles,
          });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("/sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response?.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // => 30 dias
        path: "/",
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // => 30 dias
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");

      authChannel.postMessage("signIn");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
