import { useState, useEffect, useCallback } from "react";
import { getDashboardSummary, getFichaResumen } from "./dashboardService";

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar dashboard y ficha en paralelo para evitar doble espera
      const [dashResult, fichaResult] = await Promise.all([
        getDashboardSummary(),
        getFichaResumen(),
      ]);
      setData(dashResult);
      setFicha(fichaResult);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    ficha,
    loading,
    reload: loadDashboard,
  };
};
