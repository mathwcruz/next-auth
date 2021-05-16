import { useEffect } from "react";
import { Can } from "../components/Can";

import { useAuth } from "../contexts/AuthContext";

import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";

import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    api.get("/me")
    .then(response => {
    });
  }, [])

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

  return {
    props: {},
  };
});