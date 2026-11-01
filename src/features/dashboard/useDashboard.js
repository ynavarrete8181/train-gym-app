import { useState, useEffect, useCallback } from "react";
import { getDashboardSummary } from "./dashboardService";

// El Home solo consulta su resumen personal.
// No llamar a /inventario/productos: es una ruta administrativa y la app no posee un catálogo público todavía.
export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [productos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummary();
      setData(summary || {});
    } catch (_error) {
      setError("No se pudo actualizar tu resumen.");
      setData((current) => current || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, productos, ficha: null, loading, error, reload: loadDashboard };
};
