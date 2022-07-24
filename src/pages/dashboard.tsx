import { useAuth } from "../contexts/AuthContext";
import { UserCanAccess } from "../components/UserCanAccess";

import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sair</button>

      <UserCanAccess permissions={["metrics.list"]} roles={["administrator"]}>
        <div>Métricas</div>
      </UserCanAccess>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const { data } = await apiClient.get("/me");

  return {
    props: {
      user: data,
    },
  };
});
