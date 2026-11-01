import apiClient from "../../api/apiClient";

// El endpoint personal devuelve ApiResponse::exito con los datos bajo "datos".
// Las fallas se propagan al hook para mostrar un estado de reintento sin RedBox.
export const getDashboardSummary = async () => {
  const { data } = await apiClient.get("/app/dashboard");
  return data?.datos ?? data?.data ?? null;
};

// Lecturas heredadas de otras vistas; no ejecutadas por el Home.
export const getFichaResumen = async () => {
  const { data } = await apiClient.get("/app/fichas");
  return data?.datos ?? data?.data ?? null;
};
