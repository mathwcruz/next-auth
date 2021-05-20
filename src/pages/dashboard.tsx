import { useAuth } from "../contexts/AuthContext";
import { Can } from "../components/Can";

import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sair</button>

      <Can permissions={["metrics.list"]} roles={["administrator"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx); // buscando os cookies por lado do servidor
  const { data } = await apiClient.get("/me");

  return {
    props: {
      user: data,
    },
  };
});