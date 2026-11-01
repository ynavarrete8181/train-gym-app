import apiClient from "../../../api/apiClient";

export async function obtenerMisMembresias() {
  const response = await apiClient.get("/app/mis-membresias");
  const result = response.data?.datos ?? response.data?.data ?? [];
  return Array.isArray(result) ? result : [];
}
