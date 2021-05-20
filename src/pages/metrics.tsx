import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics:</h1>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx); // buscando os cookies por lado do servidor
  const { data } = await apiClient.get("/me");

  return {
    props: {
      metrics: data,
    },
  };
}, { // objeto contendo opções de permissões e roles para autenticar o usuário, se ele pode ver essa página
  permissions: ["metrics.list"],
  roles: ["administrator"],
});