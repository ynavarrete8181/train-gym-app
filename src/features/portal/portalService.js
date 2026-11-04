import apiClient from "../../api/apiClient";

export async function getPortal() {
  const response = await apiClient.get("/app/portal");
  return response.data?.datos ?? response.data?.data ?? {};
}
