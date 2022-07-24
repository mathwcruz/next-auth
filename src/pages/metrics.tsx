import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics:</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const { data } = await apiClient.get("/me");

    return {
      props: {
        metrics: data,
      },
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
