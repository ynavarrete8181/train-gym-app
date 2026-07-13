import apiClient from "../../api/apiClient";

export const getProgressSummary = async (filter = 'todo') => {
  try {
    const { data } = await apiClient.get('/app/progreso', {
      params: { filter }
    });
    return data;
  } catch (error) {
    console.error("Error obteniendo resumen de progreso:", error);
    throw error;
  }
};
