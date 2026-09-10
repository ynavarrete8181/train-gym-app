import apiClient from "../../api/apiClient";

export const getDashboardSummary = async () => {
  try {
    const { data } = await apiClient.get('/app/dashboard');
    return data.data; // data.data porque el backend devuelve json(['data' => ...])
  } catch (error) {
    console.error("Error obteniendo el dashboard:", error);
    return null;
  }
};

/**
 * Obtiene la ficha técnica (métricas corporales) para el resumen rápido del home.
 * Devuelve la ficha actual + historial de evaluaciones para calcular deltas vs inicio.
 */
export const getFichaResumen = async () => {
  try {
    const { data } = await apiClient.get('/app/fichas');
    return data.data; // { ficha, evaluaciones }
  } catch (error) {
    console.error("Error obteniendo ficha para resumen:", error);
    return null;
  }
};

/**
 * Obtiene los productos disponibles en inventario para mostrar en la tienda/promo.
 */
export const getProductosTienda = async () => {
  try {
    const { data } = await apiClient.get('/inventario/productos');
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
};
