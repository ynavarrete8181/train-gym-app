import { ScrollView, View, RefreshControl, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import LoadingView from "../../components/common/LoadingView";
import ExerciseCard from "../../components/routine/ExerciseCard";
import RoutineHeader from "../../components/routine/RoutineHeader";
import WeekSelector from "../../components/routine/WeekSelector";
import DaySelector from "../../components/routine/DaySelector";
import ExecutionModal from "../../components/routine/ExecutionModal";
import AppHeader from "../../components/common/AppHeader";
import { useRoutine } from "../../features/routine/useTodayRoutine";
import { registerExecution } from "../../features/routine/routineService";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

import CustomAlert from "../../components/common/CustomAlert";

export default function RoutinePage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { 
    selectedWeek, 
    selectedDay, 
    setSelectedWeek, 
    setSelectedDay, 
    totalWeeks,
    routine, 
    notConfigured,
    noPlan,
    loading, 
    reload 
  } = useRoutine();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  useRefreshOnFocus(scrollRef, () => reload(true), { skipInitial: true });

  const onRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleSaveExecution = async (payload) => {
    try {
      // Agregar datos necesarios que no vienen del modal
      payload.plan_id = routine.planId;
      payload.semana = selectedWeek || routine.week || 1;
      payload.dia = selectedDay || routine.day;
      // Usar la fecha actual (idealmente la del dispositivo)
      payload.fecha_ejecucion = new Date().toISOString().split('T')[0];

      await registerExecution(payload);
      setSelectedExercise(null);
      showAlert("¡Excelente!", "Tu ejecución ha sido registrada.", "success");
      reload(true); // Recargar la rutina silenciosamente (sin pantalla de carga) para actualizar los datos
    } catch (_error) {
      showAlert("Error", "No se pudo registrar la ejecución. Intenta de nuevo.", "error");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingView message="Cargando rutina..." />;
    }

    if (noPlan) {
      return (
        <EmptyState
          icon="clipboard-text-off-outline"
          title="Sin asignación activa"
          subtitle="Actualmente no tienes un plan de entrenamiento asignado. Visita la plataforma web para configurar tu próximo desafío."
        />
      );
    }

    if (notConfigured) {
      return (
        <EmptyState
          icon="clipboard-alert-outline"
          title="Plan no configurado"
          subtitle="Tu entrenador aún no ha configurado las rutinas de tu plan activo."
        />
      );
    }

    if (!routine?.exercises?.length) {
      return (
        <EmptyState
          icon="beach"
          title="Día de descanso"
          subtitle="No hay ejercicios programados para este día. ¡Recupera energías!"
        />
      );
    }

    return (
      <>

        {routine.exercises.map((item) => (
          <ExerciseCard
            key={item.id}
            item={item}
            planId={routine.planId}
            week={selectedWeek || routine.week || 1}
            day={selectedDay || routine.day}
            onExecute={() => setSelectedExercise(item)}
          />
        ))}
      </>
    );
  };

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="dumbbell"
        title="Rutina"
        subtitle="Tu entrenamiento del día."
        showSettings
        rounded
      />

      <ScrollView 
        ref={scrollRef}
        style={styles.scrollArea} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: getScreenBottomPadding(insets.bottom), gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Encabezado del Plan Activo - Siempre visible si tenemos datos del plan */}
        {routine && (
          <RoutineHeader
            planName={routine.planName}
            dayLabel={routine.dayLabel}
            weekLabel={routine.weekLabel}
            summary={routine.summary}
          />
        )}

        {/* Selectores debajo del encabezado - Ocultos si no hay plan o no está configurado */}
        {!noPlan && !notConfigured && (
          <>
            <WeekSelector 
              totalWeeks={totalWeeks}
              selectedWeek={selectedWeek} 
              onSelectWeek={setSelectedWeek} 
            />
            
            <DaySelector 
              selectedDay={selectedDay} 
              onSelectDay={setSelectedDay} 
            />
          </>
        )}

        {/* Contenido dinámico (Loading, EmptyState, Ejercicios) */}
        {renderContent()}
      </ScrollView>

      {/* Modal de Ejecución */}
      <ExecutionModal 
        visible={!!selectedExercise}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onSave={handleSaveExecution}
      />

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
    marginTop: -20,
    zIndex: 10,
  },
});
