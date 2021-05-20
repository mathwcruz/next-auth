import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(fn: GetServerSideProps<P>) { // recebe uma função do tipo getServerSideProps
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => { // retornando uma função com a lógica dos cookies para que o Next possa compreender e executar o método getServerSideProps
    const cookies = parseCookies(ctx); // buscando os cookies armazenados no navegador

    if (cookies["nextauth.token"]) {
      // caso haja um token salvo nos cookies, ou seja, o usuário ja esteja autenticado, irá redirecioná-lo para a page de dashboard
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    };

    return await fn(ctx); // retornando a função original que foi recebida por propriedade
  };
};
