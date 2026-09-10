import { useState, useEffect, useCallback } from "react";
import { getDashboardSummary, getFichaResumen, getProductosTienda } from "./dashboardService";

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [ficha, setFicha] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar dashboard, ficha y productos en paralelo
      const [dashResult, fichaResult, productosResult] = await Promise.all([
        getDashboardSummary(),
        getFichaResumen(),
        getProductosTienda(),
      ]);
      setData(dashResult);
      setFicha(fichaResult);
      setProductos(productosResult || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadDashboard]);

  return {
    data,
    ficha,
    productos,
    loading,
    reload: loadDashboard,
  };
};
