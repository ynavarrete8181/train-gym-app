import apiClient from "../../api/apiClient";

export const getRoutineByDay = async (week, day) => {
  try {
    const { data } = await apiClient.get('/app/rutinas', {
      params: { week, day }
    });
    
    const routineData = data.data;
    if (routineData) {
      routineData.dayLabel = `Día ${day}`;
      routineData.weekLabel = `Semana ${week}`;
      routineData.summary = {
        exercises: routineData.exercises ? routineData.exercises.length : 0,
        blocks: 1, // Puedes actualizar esto desde el backend si tienes bloques
        completed: 0 // Se calculará después de mapear en el backend, o lo calculamos aquí
      };
    }
    // Calcular los completados basándonos en los status devueltos por el backend
    if (routineData && routineData.exercises) {
      routineData.summary.completed = routineData.exercises.filter(
        ex => ex.status === 'COMPLETADO' || ex.status === 'PARCIAL'
      ).length;
    }

    return { data: routineData, notConfigured: data.notConfigured || false };
  } catch (error) {
    console.error("Error obteniendo la rutina:", error);
    return { data: null, notConfigured: false };
  }
};

export const getExerciseDetail = async (id) => {
  try {
    const { data } = await apiClient.get(`/app/ejercicios/${id}`);
    // data.data contiene el JSON mapeado desde AppEjercicioController
    return data.data;
  } catch (error) {
    console.error("Error obteniendo el detalle del ejercicio:", error);
    return null;
  }
};

export const registerExecution = async (payload) => {
  try {
    const { data } = await apiClient.post('/app/rutinas/ejecutar', payload);
    return data;
  } catch (error) {
    throw error;
  }
};
