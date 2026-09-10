import apiClient from "../../api/apiClient";

export const getAccessCredential = async () => {
  const { data } = await apiClient.get("/app/acceso");
  return data.data;
};
