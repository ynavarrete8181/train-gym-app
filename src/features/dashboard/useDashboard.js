import { useState, useEffect, useCallback } from "react";
import { getDashboardSummary } from "./dashboardService";
import { obtenerProductosTienda } from "../tienda/services/tiendaService";

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummary();
      setData(summary || {});
      const sedeId = summary?.sede_id || summary?.membresia?.sede_id || summary?.usuario?.sede_id || null;
      try {
        const catalog = await obtenerProductosTienda(sedeId);
        setProductos(catalog);
      } catch (catalogError) {
        // La tienda no debe bloquear el Home ni generar overlays rojos de Expo.
        setProductos([]);
        // El estado vacío del catálogo informa al usuario sin interrumpir la navegación.
      }
    } catch (_error) {
      setError("No se pudo actualizar tu resumen.");
      setData(current => current || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, productos, ficha: null, loading, error, reload: loadDashboard };
};
