import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from "jwt-decode";

import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

interface WithSSRAuthOptions {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    // retornando uma função com a lógica dos cookies para que o Next possa compreender e executar o método getServerSideProps
    const cookies = parseCookies(ctx); // buscando os cookies armazenados no navegador
    const token = cookies["nextauth.token"];

    if (!token) {
      // caso não haja um token salvo nos cookies, ou seja, o usuário ainda não esteja autenticado, irá redirecioná-lo para a page de login
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    };

    if (options) { // caso o usuário envie um array de options para permitir acesso á página
      const user = decode<{ permissions: string[], roles: string[] }>(token); // decodificando o token salvo nos cookies com os dados do usuário
      const { permissions, roles } = options; // buscando as roles e permissions necessárias para aquela página, para validar o acesso do usuário

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) { // caso o usuário não tenha permissão para a cessar aquela página, ele será redirecionado para o dashboard
        return {
          redirect: {
            destination: "/dashboard",
            permanent: false,
          },
        };
      };
    };

    try {
      return await fn(ctx); // tenta executar a função chamada no getServerSideProps
    } catch (error) {
      if (error instanceof AuthTokenError) { // caso o erro seja um erro de token
        destroyCookie(ctx, "nextauth.token"); // apagando o token dos cookies para redirecionamento
        destroyCookie(ctx, "nextauth.refreshToken"); // apagando o refresh token dos cookies para redirecionamento

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      };
    };
  };
};
