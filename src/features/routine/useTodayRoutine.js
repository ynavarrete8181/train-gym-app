import { useEffect, useState, useCallback } from "react";
import { getRoutineByDay } from "./routineService";

// Helper to get current day string
const getCurrentDay = () => {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};

export const useRoutine = () => {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [routine, setRoutine] = useState(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [noPlan, setNoPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalWeeks, setTotalWeeks] = useState(4);

  const loadRoutine = useCallback(async (week, day, silent = false) => {
    if (!silent) setLoading(true);
    setNotConfigured(false);
    try {
      const response = await getRoutineByDay(week, day);
      setRoutine(response.data);
      setNotConfigured(response.notConfigured);
      setNoPlan(response.noPlan || false);
      if (response.data?.week && week == null) {
        setSelectedWeek(response.data.week);
      }
      if (response.data?.totalWeeks) {
        setTotalWeeks(response.data.totalWeeks);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRoutine(selectedWeek, selectedDay);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [selectedWeek, selectedDay, loadRoutine]);

  const reload = useCallback((silent = false) => loadRoutine(selectedWeek, selectedDay, silent), [loadRoutine, selectedDay, selectedWeek]);

  return {
    selectedWeek,
    selectedDay,
    setSelectedWeek,
    setSelectedDay,
    totalWeeks,
    routine,
    notConfigured,
    noPlan,
    loading,
    reload,
  };
};
