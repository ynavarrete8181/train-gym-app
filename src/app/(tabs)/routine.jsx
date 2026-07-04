import { useRouter } from "expo-router";
import { ScrollView, View, Alert, RefreshControl, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
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

import CustomAlert from "../../components/common/CustomAlert";
import WebSemanticButton from "../../components/common/WebSemanticButton";

export default function RoutinePage() {
  const router = useRouter();
  const { 
    selectedWeek, 
    selectedDay, 
    setSelectedWeek, 
    setSelectedDay, 
    routine, 
    notConfigured,
    loading, 
    reload 
  } = useRoutine();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleSaveExecution = async (payload) => {
    try {
      // Agregar datos necesarios que no vienen del modal
      payload.plan_id = routine.planId;
      // Usar la fecha actual (idealmente la del dispositivo)
      payload.fecha_ejecucion = new Date().toISOString().split('T')[0];

      await registerExecution(payload);
      setSelectedExercise(null);
      showAlert("¡Excelente!", "Tu ejecución ha sido registrada.", "success");
      reload(); // Recargar la rutina para mostrar el check verde
    } catch (error) {
      showAlert("Error", "No se pudo registrar la ejecución. Intenta de nuevo.", "error");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingView message="Cargando rutina..." />;
    }

    if (notConfigured) {
      return (
        <View style={[appStyles.container, { flex: 1, justifyContent: "center" }]}>
          <EmptyState
            title="Plan no configurado"
            subtitle="Tu entrenador aún no ha configurado las rutinas de tu plan activo."
          />
        </View>
      );
    }

    if (!routine?.exercises?.length) {
      return (
        <View style={[appStyles.container, { flex: 1, justifyContent: "center" }]}>
          <EmptyState
            title="Día de descanso"
            subtitle="No hay ejercicios programados para este día. ¡Recupera energías!"
          />
        </View>
      );
    }

    return (
      <>

        {routine.exercises.map((item) => (
          <ExerciseCard
            key={item.id}
            item={item}
            planId={routine.planId}
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
      />

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, gap: 16 }}
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

        {/* Selectores debajo del encabezado */}
        <WeekSelector 
          selectedWeek={selectedWeek} 
          onSelectWeek={setSelectedWeek} 
        />
        
        <DaySelector 
          selectedDay={selectedDay} 
          onSelectDay={setSelectedDay} 
        />

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
  }
});
