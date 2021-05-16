import Router from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";

import { api } from "../services/apiClient";

interface User {
  email: string;
  permissions: string[];
  roles: string[];
};

interface SignInCredentials {
  email: string;
  password: string;
};

interface AuthContextData {
  signIn: (credentials: SignInCredentials) => Promise<void>; // colocar a função de login no contexto, para controlar a autenticação do usuário em qualquer tela da app
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

interface AuthProviderProps {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel; // declarando a variável fora do escopo pois deve-se usar ela apenas no client ()browser e não no lado do server

export const signOut = () => {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('signOut'); // "enviado" uma mensagem a todos as abas que consomem este canal

  Router.push("/")
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; // verifica se existe um usuário ou não, caso haja, está autenticado, caso contrário, não tem permissão

  useEffect(() => {
    authChannel = new BroadcastChannel('auth'); // criando uma canal para compartilhar informações entre várias abas com o mesmo canal de origem

    authChannel.onmessage = (message) => {
      switch (message?.data) {
        case 'signOut': // caso a mensagem salva no canal seja de 'signOut', irá deslogar da aplicação em todas as abas
          signOut();
          authChannel.close();
          break
        case 'signIn':
          window.location.replace("http://localhost:3000/dashboard"); // caso a mensagem salva no canal seja de 'signIn', irá redirecionar o usuário para o dashboard, pois ele já está logado
          break
        default:
          break;
      };
    };
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies(); // pegando o token salvo nos cookies

    if (token) {
      api.get("/me").then(response => {
        const { email, permissions, roles } = response.data; // pegando os dados trazidos pela requisição ao backend

        setUser({
          email,
          permissions,
          roles,
        });
      })
      .catch(() => { // caso haja um erro, desloga o usuário
        signOut();
      });
    };
  }, []); // apenas na primeira vez que o usuário loga na app, irá buscar os dados do token salvos nos cookies, fazer uma requisição ao backend 

  const signIn = async({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("/sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // por quanto tempo quero deixar salvo no cookie este dado
        path: '/', // páginas do app que terão acesso a este cookie
      }); // quando quer lidar com cookie mas a ação que requer autenticação depende de uma ação do usuário, passa-se undefined como primeiro parametro, segundo parametro é o nome do cookie, o terceiro é o dado para ser armazenado no cookie e o ultimo são configurações
      setCookie(undefined, "nextauth.refreshToken", refreshToken , {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles, 
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`; // após logar na app, enviando nas requisições, o token para autenticação do usuário

      Router.push("/dashboard");

      authChannel.postMessage("signIn");
    } catch (error) {
      console.log(error.message);
    };
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isAuthenticated }}>
      { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};