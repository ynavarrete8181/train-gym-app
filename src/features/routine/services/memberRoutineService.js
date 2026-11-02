import apiClient from "../../../api/apiClient";

export async function consultarMiRutina(semana, dia) {
  const response = await apiClient.get("/app/rutinas", {
    params: { semana, dia: String(dia).toUpperCase() },
  });
  return response.data?.datos ?? response.data?.data ?? null;
}
