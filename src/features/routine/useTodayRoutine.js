import { useEffect, useState, useCallback } from "react";
import { getRoutineByDay } from "./routineService";

// Helper to get current day string
const getCurrentDay = () => {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};

export const useRoutine = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [routine, setRoutine] = useState(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRoutine = useCallback(async (week, day) => {
    setLoading(true);
    setNotConfigured(false);
    try {
      const response = await getRoutineByDay(week, day);
      setRoutine(response.data);
      setNotConfigured(response.notConfigured);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutine(selectedWeek, selectedDay);
  }, [selectedWeek, selectedDay, loadRoutine]);

  return {
    selectedWeek,
    selectedDay,
    setSelectedWeek,
    setSelectedDay,
    routine,
    notConfigured,
    loading,
    reload: () => loadRoutine(selectedWeek, selectedDay),
  };
};
