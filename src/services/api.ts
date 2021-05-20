import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestsQueue = []; // fila de requisições

export const setupAPIClient = (ctx = undefined) => { // recebe o contexto para lidar com os cookies
  let cookies = parseCookies(ctx); // pegando os cookies por meio do servidor

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`, // enviando o token salvo nos cookies para a requisição, para validar no backend o acesso do usuário
    },
  });

  // interceptando uma resposta do backend, caso ele informe que o token esteja expirado
  api.interceptors.response.use(
    (response) => {
      // primeiro parametro informa o que fazer caso a requisição de sucesso
      return response;
    },
    (error: AxiosError) => {
      // segundo parametro informa o que fazer caso a requisição de erro, intercepte algo
      if (error?.response?.status === 401) {
        if (error?.response?.data?.code === "token.expired") {
          // verificando se o error que ocorreu, foi de token expirado
          cookies = parseCookies(ctx); // buscando dados atualizados salvos nos cookies

          const { "nextauth.refreshToken": refreshToken } = cookies; // buscando o refreshToken dos cookies
          const originalConfig = error?.config; // configuração da requisição ao back end

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post("/refresh", {
                // realizando um post na rota de refresh token para buscar um novo token, pois o atual está expirado
                refreshToken,
              })
              .then((response) => {
                const { token } = response?.data; // buscando o novo token gerado pelo back end

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // => 30 dias
                  path: "/",
                }); // atualizado o token que o back end acabou de gerar para salvar nos cookies

                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response?.data?.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30,
                    path: "/",
                  }
                ); // atualizado o refreshToken que o back end acabou de gerar para salvar nos cookies

                api.defaults.headers["Authorization"] = `Bearer ${token}`; // atualizando o token que está sendo enviado nas requisições

                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(token) // nova chamada a api com o token atualizado
                );

                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );

                failedRequestsQueue = [];

                if (process?.browser) {
                  // indica se o código está sendo executado do lado do browser ou do servidor
                  signOut(); // deslogando o usuário caso esteja rodando no browser
                };
              })
              .finally(() => {
                isRefreshing = false;
              });
          };

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                // o que irá acontecer quando o processo de refresh do token finalizar
                originalConfig.headers["Authorization"] = `Bearer ${token}`; // envia o token atualizado

                resolve(api(originalConfig)); // chamando novamente a api, com o token att
              },
              onFailure: (err: AxiosError) => {
                // o que irá acontecer caso o processo do refresh token tenha dado errado
                reject(err);
              },
            });
          });
        } else {
          if (process?.browser) {
            signOut(); // deslogando o usuário caso esteja rodando no browser
          } else {
            return Promise.reject(new AuthTokenError()); // retornando um erro ao server side
          };
        };
      };

      return Promise.reject(error);
    },
  );

  return api;
};
