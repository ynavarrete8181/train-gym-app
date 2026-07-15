import { useLocalSearchParams } from "expo-router";
import { Fragment, useCallback, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Modal as RNModal, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import Svg, { Circle, Line as SvgLine, Path, Text as SvgText } from "react-native-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppCard from "../../components/common/AppCard";
import AppModal from "../../components/common/AppModal";
import AppWatermarkBackground from "../../components/common/AppWatermarkBackground";
import WebSemanticButton from "../../components/common/WebSemanticButton";
import AppHeader from "../../components/common/AppHeader";
import LoadingView from "../../components/common/LoadingView";
import SeriesRow from "../../components/routine/SeriesRow";
import SmartVideoPlayer from "../../components/routine/SmartVideoPlayer";
import SecuenciaEjecucionModal from "../../components/routine/SecuenciaEjecucionModal";
import PlannedSeriesList, { TYPE_HELP } from "../../components/routine/PlannedSeriesList";
import AppBadge from "../../components/common/AppBadge";
import CustomAlert from "../../components/common/CustomAlert";
import apiClient from "../../api/apiClient";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { modalStyles } from "../../theme/modalStyles";
import { getBottomSafePadding, getScreenBottomPadding, getScreenTopPadding } from "../../theme/layout";
import { calculateTemporaryRmLoads, clearTemporaryRm, getRoutineByDay } from "../../features/routine/routineService";

export default function ExerciseDetailPage() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { id } = params;
  const initialPlannedSeries = parsePlannedSeries(params.planned_series);
  const [detail, setDetail] = useState(null);
  const [plannedSeries, setPlannedSeries] = useState(initialPlannedSeries);
  const [manualRm, setManualRm] = useState("");
  const [calculatingRm, setCalculatingRm] = useState(false);
  const [rmCalculationError, setRmCalculationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('carga');
  const [showChartModal, setShowChartModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [showPlanHelpModal, setShowPlanHelpModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  const loadExerciseDetail = useCallback(async () => {
    const { data } = await apiClient.get(`/app/ejercicios/${id}`, {
      params: {
        plan_id: params.plan_id,
        plan_ejercicio_id: params.plan_ejercicio_id,
        week: params.week,
        day: params.day,
      },
    });
    const nextDetail = data.data;
    setDetail(nextDetail);
    if (nextDetail?.ejecucion?.rm_estimado_temporal) {
      setManualRm(String(nextDetail.ejecucion.rm_estimado_temporal));
    }
  }, [id, params.day, params.plan_ejercicio_id, params.plan_id, params.week]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadExerciseDetail();
      } catch (error) {
        console.error("Error obteniendo el detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, loadExerciseDetail]);

  const initiallyMissingRm = initialPlannedSeries.some((serie) => isMissingRmPrescription(serie));
  const hasMissingRm = plannedSeries.some((serie) => isMissingRmPrescription(serie));
  const hasCalculatedTemporaryRm = plannedSeries.some((serie) => serie?.prescripcion_carga?.rm_origen === "estimado_manual_sesion");
  const showRmEstimateBox = initiallyMissingRm || hasMissingRm || hasCalculatedTemporaryRm;
  const manualRmNumber = normalizeNumericInput(manualRm);

  const handleApplyTemporaryRm = async () => {
    const rm = normalizeNumericInput(manualRm);
    if (!rm) {
      setRmCalculationError("Ingresa un RM estimado válido.");
      return;
    }

    const planId = params.plan_id || detail?.plan_id;
    const planExerciseId = params.plan_ejercicio_id || detail?.plan_ejercicio_id;

    if (!planId || !planExerciseId) {
      setRmCalculationError("No se encontró el contexto del plan para calcular.");
      return;
    }

    try {
      setCalculatingRm(true);
      setRmCalculationError("");
      const result = await calculateTemporaryRmLoads({
        plan_id: planId,
        plan_ejercicio_id: planExerciseId,
        rm_estimado: rm,
        semana: parseInt(params.week || detail?.week || 1, 10),
        dia: params.day || detail?.day || getCurrentDayKey(),
        fecha_ejecucion: new Date().toISOString().split("T")[0],
      });
      const calculatedSeries = Array.isArray(result?.series) ? result.series : [];
      setPlannedSeries(calculatedSeries);
      setDetail((current) => current
        ? {
            ...current,
            ejecucion: {
              ...(current.ejecucion || {}),
              rm_estimado_temporal: result?.rm_estimado_temporal ?? rm,
            },
          }
        : current);

      const routineResponse = await getRoutineByDay(
        parseInt(params.week || detail?.week || 1, 10),
        params.day || detail?.day || getCurrentDayKey()
      );
      const refreshedExercise = routineResponse?.data?.exercises?.find(
        (exercise) => String(exercise.plan_ejercicio_id) === String(planExerciseId)
      );

      if (refreshedExercise?.plannedSeries?.length) {
        setPlannedSeries(refreshedExercise.plannedSeries);
        setDetail((current) => current
          ? {
              ...current,
              ejecucion: refreshedExercise.ejecucion || current.ejecucion,
            }
          : current);
      }
    } catch (_error) {
      setRmCalculationError("No se pudo calcular con ese RM estimado.");
    } finally {
      setCalculatingRm(false);
    }
  };

  const handleClearTemporaryRm = async () => {
    const planId = params.plan_id || detail?.plan_id;
    const planExerciseId = params.plan_ejercicio_id || detail?.plan_ejercicio_id;

    if (planId && planExerciseId) {
      try {
        const result = await clearTemporaryRm({
          plan_id: planId,
          plan_ejercicio_id: planExerciseId,
          semana: parseInt(params.week || detail?.week || 1, 10),
          dia: params.day || detail?.day || getCurrentDayKey(),
        });
        if (Array.isArray(result?.series)) {
          setPlannedSeries(result.series);
        }
      } catch (_error) {
        setRmCalculationError("No se pudo borrar el RM temporal.");
      }
    }

    setManualRm("");
    setDetail((current) => current
      ? {
          ...current,
          ejecucion: current.ejecucion
            ? { ...current.ejecucion, rm_estimado_temporal: null }
            : current.ejecucion,
        }
      : current);

    const routineResponse = await getRoutineByDay(
      parseInt(params.week || detail?.week || 1, 10),
      params.day || detail?.day || getCurrentDayKey()
    );
    const refreshedExercise = routineResponse?.data?.exercises?.find(
      (exercise) => String(exercise.plan_ejercicio_id) === String(planExerciseId)
    );

    if (refreshedExercise?.plannedSeries?.length) {
      setPlannedSeries(refreshedExercise.plannedSeries);
      setDetail((current) => current
        ? {
            ...current,
            ejecucion: refreshedExercise.ejecucion || current.ejecucion,
          }
        : current);
    }
  };

  const handleSaveSequence = async (payload) => {
    try {
      payload.plan_ejercicio_id = params.plan_ejercicio_id || detail?.plan_ejercicio_id || id;
      if (detail?.plan_id) payload.plan_id = detail.plan_id;
      else if (params.plan_id) payload.plan_id = params.plan_id;
      payload.semana = parseInt(params.week || detail?.week || 1, 10);
      payload.dia = params.day || detail?.day || getCurrentDayKey();
      
      payload.fecha_ejecucion = new Date().toISOString().split('T')[0];

      await apiClient.post('/app/rutinas/ejecutar', payload);
      setShowSequenceModal(false);
      
      setTimeout(() => {
        setAlertConfig({ visible: true, title: "¡Excelente!", message: "Tu ejecución ha sido registrada.", type: "success" });
      }, 500);
      
      await loadExerciseDetail();
    } catch (error) {
      setShowSequenceModal(false);

      let errorMessage = "No se pudo registrar la ejecución. Intenta de nuevo.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Si hay errores de validación específicos (Laravel), tomar el primero
        if (error.response?.data?.errors) {
          const firstErrorKey = Object.keys(error.response.data.errors)[0];
          if (firstErrorKey) {
             errorMessage = error.response.data.errors[firstErrorKey][0];
          }
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setTimeout(() => {
        setAlertConfig({ 
          visible: true, 
          title: "Atención", 
          message: errorMessage, 
          type: "error" 
        });
      }, 500);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExerciseDetail();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !detail) {
    return (
      <SafeAreaView style={appStyles.screen}>
        <LoadingView message="Cargando detalles del ejercicio..." />
      </SafeAreaView>
    );
  }

  const dailyReport = buildExecutionReport(plannedSeries, detail.ejecucion, {
    series: params.series,
    reps: params.reps,
    load: params.load,
  });

  return (
    <AppWatermarkBackground style={appStyles.screen}>
      <AppHeader
        title="Detalle de Ejercicio"
        showBack
      />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: getScreenBottomPadding(insets.bottom, 84) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 20 }}>
          {/* Header del Ejercicio */}
          <View style={{ gap: 8 }}>
            <Text style={styles.exerciseTitle}>
              {detail.name}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {detail.tags?.map(tag => (
                <AppBadge key={tag} tone="primary">{tag}</AppBadge>
              ))}
            </View>
          </View>

          {/* Video Player */}
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            {detail.videoUrl ? <SmartVideoPlayer url={detail.videoUrl} /> : (
              <View style={{ height: 200, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
                <MaterialCommunityIcons name="play-circle-outline" size={48} color={colors.primary} />
              </View>
            )}
          </View>

            {detail.historial && detail.historial.length > 0 && (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, backgroundColor: '#fff' }}
                onPress={() => setShowChartModal(true)}
              >
                <MaterialCommunityIcons name="chart-line" size={20} color={colors.primary} />
                <Text style={{ marginLeft: 6, fontSize: 13, color: '#111827', fontWeight: '700' }}>Evolución</Text>
              </TouchableOpacity>
            )}
          {/* Historial Reciente */}
          {detail.historial && detail.historial.length > 0 && (
            <AppCard style={{ borderLeftWidth: 6, borderLeftColor: colors.info || '#3B82F6' }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
                <Text style={styles.cardTitle}>
                  Últimas Ejecuciones
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {detail.historial.map((h, index) => (
                  <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: index < detail.historial.length - 1 ? 1 : 0, borderBottomColor: "rgba(0,0,0,0.05)", paddingBottom: index < detail.historial.length - 1 ? 12 : 0 }}>
                    <View style={{ gap: 4 }}>
                      <Text style={{ fontWeight: "800", color: colors.text }}>
                        {new Date(h.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </Text>
                      {h.rpe ? (
                        <Text style={{ fontSize: 12, color: colors.textSoft }}>RPE: {h.rpe}</Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontWeight: "900", fontSize: 16, color: colors.primary }}>
                        {h.carga ? `${parseFloat(h.carga)} kg` : 'Libre'}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSoft }}>
                        {h.series} series
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </AppCard>
          )}

          {/* Cómo se hace */}
          <AppCard style={{ borderLeftWidth: 6, borderLeftColor: colors.success || '#10B981' }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <MaterialCommunityIcons name="text-box-check-outline" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>
                ¿Cómo se hace?
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {detail.instructions?.map((step, index) => (
                <View key={index} style={{ flexDirection: "row", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.primary }}>{index + 1}.</Text>
                  <Text style={{ flex: 1, color: colors.textSoft, lineHeight: 20 }}>{step}</Text>
                </View>
              ))}
            </View>
            {detail.tips && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: "#FFF4E5", borderRadius: 12 }}>
                <Text style={{ color: "#E69900", fontWeight: "600", fontSize: 13 }}>💡 Tip: {detail.tips}</Text>
              </View>
            )}
          </AppCard>

          {/* Planificación */}
          <AppCard style={{ borderLeftWidth: 6, borderLeftColor: colors.warning || '#F59E0B' }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <MaterialCommunityIcons name="target" size={20} color={colors.primary} />
                <Text style={styles.planTitle}>
                  Tu planificación
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPlanHelpModal(true)}
                style={styles.helpButton}
                accessibilityLabel="Ver significado de tipos de planificación"
              >
                <MaterialCommunityIcons name="help" size={22} color="#6D4AFF" />
              </TouchableOpacity>
            </View>
            <SeriesRow label="Objetivo" value={`${params.series || 0} series x ${params.reps || 0} reps`} />
            <SeriesRow label="Tipo / objetivo" value={getPlanTargetLabel(plannedSeries, params.load)} />
            <SeriesRow label="Esfuerzo (RPE)" value={params.rpe || ""} />
            {showRmEstimateBox ? (
              <View style={styles.rmEstimateBox}>
                <View style={styles.rmEstimateHeader}>
                  <MaterialCommunityIcons
                    name={hasCalculatedTemporaryRm ? "check-circle" : "alert-circle-outline"}
                    size={18}
                    color={hasCalculatedTemporaryRm ? colors.success : colors.warning}
                  />
                  <Text style={styles.rmEstimateTitle}>No cuenta con RM registrado</Text>
                </View>
                <View style={styles.rmEstimateRow}>
                  <TextInput
                    style={styles.rmEstimateInput}
                    keyboardType="numeric"
                    value={manualRm}
                    onChangeText={(value) => {
                      setManualRm(value);
                      setRmCalculationError("");
                    }}
                    placeholder="RM estimado"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={[
                      styles.rmEstimateButton,
                      (!manualRmNumber || calculatingRm) && styles.rmEstimateButtonDisabled,
                    ]}
                    onPress={handleApplyTemporaryRm}
                    disabled={!manualRmNumber || calculatingRm}
                  >
                    <MaterialCommunityIcons
                      name={calculatingRm ? "loading" : "check"}
                      size={22}
                      color={manualRmNumber && !calculatingRm ? "#10B981" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                  {(manualRm || hasCalculatedTemporaryRm) ? (
                    <TouchableOpacity
                      style={styles.rmEstimateClear}
                      onPress={handleClearTemporaryRm}
                      accessibilityLabel="Borrar RM estimado"
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text style={styles.rmEstimateHelp}>
                  {hasCalculatedTemporaryRm
                    ? "Listo. Las series fueron recalculadas por backend para esta sesión."
                    : "Ingresa un estimado y presiona el visto verde para ver los pesos antes de iniciar."}
                </Text>
                {rmCalculationError ? <Text style={styles.rmEstimateError}>{rmCalculationError}</Text> : null}
              </View>
            ) : null}
            <View style={{ marginTop: 14 }}>
              <PlannedSeriesList series={plannedSeries} />
            </View>
          </AppCard>

          {dailyReport ? (
            <DailyExecutionReport report={dailyReport} />
          ) : null}
        </View>
      </ScrollView>

      <AppModal
        visible={showPlanHelpModal}
        title="Tipos de planificación"
        subtitle="Cómo interpretar cada serie"
        icon="help-circle-outline"
        onClose={() => setShowPlanHelpModal(false)}
      >
        <View style={{ gap: 12 }}>
          {TYPE_HELP.map(([label, description]) => (
            <View
              key={label}
              style={{
                gap: 4,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={styles.helpTitle}>{label}</Text>
              <Text style={styles.helpText}>{description}</Text>
            </View>
          ))}
        </View>
      </AppModal>

      {/* Botón flotante para Iniciar Secuencia */}
      <View style={[styles.floatingContainer, { paddingBottom: getBottomSafePadding(insets.bottom, 10) }]}>
        <WebSemanticButton 
          label="Iniciar Secuencia"
          icon="play"
          tone="primary"
          onPress={() => setShowSequenceModal(true)}
        />
      </View>
      {/* Modal Gráfico de Evolución */}
      <RNModal visible={showChartModal} animationType="slide" transparent={true} onRequestClose={() => setShowChartModal(false)}>
        <View
          style={[
            modalStyles.overlay,
            {
              paddingTop: getScreenTopPadding(insets.top, 16),
              paddingBottom: getBottomSafePadding(insets.bottom, 16),
            },
          ]}
        >
          <View style={[modalStyles.modalContainer, { maxHeight: "100%" }]}>
            
            <View style={modalStyles.header}>
              <View style={modalStyles.headerContent}>
                <View style={modalStyles.iconBox}>
                  <MaterialCommunityIcons name="chart-line" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={modalStyles.title}>Evolución</Text>
                  <Text style={modalStyles.subtitle}>{detail?.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowChartModal(false)} style={modalStyles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.yellowAccent} />
            
            <View style={[modalStyles.content, { paddingBottom: 32 }]}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {[
                  { id: 'carga', label: 'Carga Máx', color: colors.primary },
                  { id: 'rpe', label: 'RPE', color: colors.accent },
                  { id: 'dolor', label: 'Dolor', color: '#EF4444' },
                  { id: 'volumen', label: 'Volumen', color: '#8B5CF6' }
                ].map(tab => (
                  <TouchableOpacity 
                    key={tab.id}
                    onPress={() => setChartType(tab.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: chartType === tab.id ? tab.color : '#F1F5F9',
                      marginRight: 8
                    }}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: '800', 
                      color: chartType === tab.id ? '#fff' : '#64748B' 
                    }}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ alignItems: 'center', overflow: 'hidden' }}>
              <LineChart
                data={[...(detail?.historial || [])].reverse().map(h => {
                  let val = 0;
                  if (chartType === 'carga') val = parseFloat(h.carga || 0);
                  if (chartType === 'rpe') val = parseFloat(h.rpe || 0);
                  if (chartType === 'dolor') val = parseFloat(h.dolor || 0);
                  if (chartType === 'volumen') {
                     let reps = 0;
                     if (h.detalle_series && Array.isArray(h.detalle_series) && h.detalle_series.length > 0) {
                        reps = h.detalle_series.reduce((acc, s) => acc + parseInt(s.reps || 0), 0);
                     } else {
                        reps = parseInt(h.series || 0) * 5; // Estimación si no hay detalle
                     }
                     val = parseFloat(h.carga || 0) * reps;
                  }
                  return {
                    value: val,
                    label: new Date(h.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    dataPointText: `${val}`
                  };
                })}
                width={280}
                height={180}
                spacing={65}
                initialSpacing={20}
                color={
                  chartType === 'carga' ? colors.primaryStrong : 
                  chartType === 'rpe' ? colors.accent : 
                  chartType === 'dolor' ? '#EF4444' : '#8B5CF6'
                }
                thickness={3}
                dataPointsColor={
                  chartType === 'carga' ? colors.primary : 
                  chartType === 'rpe' ? colors.accent : 
                  chartType === 'dolor' ? '#EF4444' : '#8B5CF6'
                }
                textFontSize={11}
                textColor={colors.textSoft}
                hideRules
                yAxisColor="transparent"
                xAxisColor="rgba(0,0,0,0.1)"
                yAxisTextStyle={{ color: colors.textSoft, fontSize: 10 }}
                noOfSections={4}
                isAnimated
              />
            </View>
          </View>
        </View>
        </View>
      </RNModal>

      {/* Modal de Secuencia de Ejecución */}
      {detail && (
        <SecuenciaEjecucionModal 
          visible={showSequenceModal}
          onClose={() => setShowSequenceModal(false)}
          onSave={handleSaveSequence}
          exerciseName={detail.name}
          initialSeries={parseInt(params.series) || 5}
          initialReps={params.reps}
          initialLoad={params.load}
          plannedSeries={plannedSeries}
          initialExecution={detail.ejecucion}
        />
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </AppWatermarkBackground>
  );
}

function parsePlannedSeries(value) {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function isMissingRmPrescription(serie) {
  return String(serie?.tipo_carga || "").toUpperCase() === "PORCENTAJE_RM"
    && serie?.prescripcion_carga
    && !serie.prescripcion_carga.carga_redondeada;
}

function normalizeNumericInput(value) {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : null;
}

function getPlanTargetLabel(series, fallback) {
  const firstCalculated = series.find((serie) => serie?.prescripcion_carga?.carga_redondeada);
  if (firstCalculated?.target_load) {
    return firstCalculated.target_load;
  }

  return fallback || "Libre";
}

function getCurrentDayKey() {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  return days[new Date().getDay()];
}

function DailyExecutionReport({ report }) {
  const tone = getComplianceTone(report.compliance);

  return (
    <AppCard style={{ borderLeftWidth: 6, borderLeftColor: tone.color }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={tone.color} />
        <Text style={styles.cardTitle}>Resultado del día</Text>
      </View>

      <View style={styles.reportSummaryGrid}>
        <ReportMetric label="Cumplimiento" value={`${report.compliance}%`} color={tone.color} />
        <ReportMetric label="Volumen" value={`${formatNumber(report.actualVolume)} kg`} />
        <ReportMetric label="Series" value={`${report.completedSets}/${report.plannedSets}`} />
      </View>

      <PlanExecutionChart rows={report.rows} />

      <View style={{ gap: 8, marginTop: 14 }}>
        {report.rows.map((row) => {
          const rowTone = getComplianceTone(row.compliance);
          return (
            <View key={row.index} style={styles.reportRow}>
              <View style={{ width: 54 }}>
                <Text style={styles.reportSetLabel}>Serie {row.index}</Text>
                <Text style={[styles.reportStatus, { color: rowTone.color }]}>{rowTone.label}</Text>
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.reportLine}>Plan: {formatPlanReal(row.planLoad, row.planReps)}</Text>
                <Text style={styles.reportLine}>Real: {formatPlanReal(row.actualLoad, row.actualReps)}</Text>
              </View>

              <View style={{ alignItems: "flex-end", minWidth: 74 }}>
                <Text style={[styles.reportPercent, { color: rowTone.color }]}>{row.compliance}%</Text>
                <Text style={styles.reportDelta}>{formatDelta(row)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {report.observation ? (
        <View style={styles.reportObservation}>
          <MaterialCommunityIcons name="note-text-outline" size={18} color={colors.primaryStrong} />
          <Text style={styles.reportObservationText}>{report.observation}</Text>
        </View>
      ) : null}

      <Text style={styles.reportNote}>{report.message}</Text>
    </AppCard>
  );
}

function PlanExecutionChart({ rows }) {
  const chartRows = rows.filter((row) => row.planLoad > 0 || row.actualLoad > 0);
  if (chartRows.length === 0) return null;

  const width = 286;
  const height = 178;
  const left = 30;
  const right = 18;
  const top = 24;
  const bottom = 36;
  const maxLoad = Math.max(...chartRows.flatMap((row) => [row.planLoad, row.actualLoad]), 1);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xFor = (index) => left + (chartRows.length === 1 ? plotWidth / 2 : (plotWidth / (chartRows.length - 1)) * index);
  const yFor = (load) => top + (1 - load / maxLoad) * plotHeight;
  const planPoints = chartRows.map((row, index) => ({ x: xFor(index), y: yFor(row.planLoad), reps: row.planReps, load: row.planLoad }));
  const actualPoints = chartRows.map((row, index) => ({ x: xFor(index), y: yFor(row.actualLoad), reps: row.actualReps, load: row.actualLoad }));

  return (
    <View style={styles.executionChartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Plan vs secuencia</Text>
        <View style={styles.chartLegend}>
          <LegendDot color="#10B981" label="Plan" />
          <LegendDot color="#EF4444" label="Real" />
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.5, 1].map((ratio) => {
          const y = top + ratio * plotHeight;
          return (
            <SvgLine
              key={ratio}
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}
        <SvgText x={left - 8} y={top + 4} fontSize="10" fill="#64748B" textAnchor="end">
          {formatNumber(maxLoad)}
        </SvgText>
        <SvgText x={left - 8} y={height - bottom + 4} fontSize="10" fill="#64748B" textAnchor="end">
          0
        </SvgText>

        {planPoints.length > 1 ? (
          <Path d={buildLinePath(planPoints)} stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {actualPoints.length > 1 ? (
          <Path d={buildLinePath(actualPoints)} stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}

        {chartRows.map((row, index) => {
          const x = xFor(index);
          return (
            <Fragment key={row.index}>
              <SvgLine x1={x} y1={top} x2={x} y2={height - bottom} stroke="#F1F5F9" strokeWidth="1" />
              <SvgText x={x} y={height - 12} fontSize="11" fontWeight="700" fill="#111827" textAnchor="middle">
                S{row.index}
              </SvgText>
            </Fragment>
          );
        })}

        {planPoints.map((point, index) => (
          <Fragment key={`plan-${index}`}>
            <Circle cx={point.x} cy={point.y} r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />
            <SvgText x={point.x} y={Math.max(12, point.y - 10)} fontSize="10" fontWeight="700" fill="#047857" textAnchor="middle">
              {point.reps}r
            </SvgText>
          </Fragment>
        ))}

        {actualPoints.map((point, index) => (
          <Fragment key={`actual-${index}`}>
            <Circle cx={point.x} cy={point.y} r="5" fill="#EF4444" stroke="#fff" strokeWidth="2" />
            <SvgText x={point.x} y={Math.min(height - bottom - 4, point.y + 18)} fontSize="10" fontWeight="700" fill="#B91C1C" textAnchor="middle">
              {point.reps}r
            </SvgText>
          </Fragment>
        ))}
      </Svg>
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function ReportMetric({ label, value, color = colors.text }) {
  return (
    <View style={styles.reportMetric}>
      <Text style={[styles.reportMetricValue, { color }]}>{value}</Text>
      <Text style={styles.reportMetricLabel}>{label}</Text>
    </View>
  );
}

function buildExecutionReport(plannedSeries, execution, fallback) {
  const actualSeries = Array.isArray(execution?.series) ? execution.series : [];
  if (actualSeries.length === 0) return null;

  const fallbackSets = toNumber(fallback.series);
  const rowsCount = Math.max(plannedSeries.length, actualSeries.length, fallbackSets || 0);
  const rows = Array.from({ length: rowsCount }).map((_, index) => {
    const planned = plannedSeries[index] || {};
    const actual = actualSeries.find((item) => Number(item.numero_serie) === index + 1) || actualSeries[index] || {};
    const planLoad = readLoad(planned.target_load ?? planned.carga_fija ?? fallback.load);
    const planReps = toNumber(planned.reps ?? fallback.reps);
    const actualLoad = readLoad(actual.carga);
    const actualReps = toNumber(actual.reps);
    const plannedVolume = planLoad && planReps ? planLoad * planReps : 0;
    const actualVolume = actualLoad && actualReps ? actualLoad * actualReps : 0;
    const complianceBase = plannedVolume > 0 ? actualVolume / plannedVolume : safeRatio(actualReps, planReps);

    return {
      index: index + 1,
      planLoad,
      planReps,
      actualLoad,
      actualReps,
      plannedVolume,
      actualVolume,
      compliance: toPercent(complianceBase),
    };
  });

  const plannedVolume = rows.reduce((sum, row) => sum + row.plannedVolume, 0);
  const actualVolume = rows.reduce((sum, row) => sum + row.actualVolume, 0);
  const plannedReps = rows.reduce((sum, row) => sum + row.planReps, 0);
  const actualReps = rows.reduce((sum, row) => sum + row.actualReps, 0);
  const compliance = plannedVolume > 0
    ? toPercent(actualVolume / plannedVolume)
    : toPercent(safeRatio(actualReps, plannedReps));

  return {
    rows,
    compliance,
    plannedVolume,
    actualVolume,
    completedSets: actualSeries.length,
    plannedSets: rowsCount,
    message: buildReportMessage(compliance, plannedVolume, actualVolume, plannedReps, actualReps),
    observation: execution?.obs || execution?.observaciones || "",
  };
}

function buildReportMessage(compliance, plannedVolume, actualVolume, plannedReps, actualReps) {
  if (compliance >= 90) {
    return "Cumpliste el objetivo del ejercicio. Buen indicador para mantener o progresar carga.";
  }
  if (compliance >= 70) {
    return "Ejecución parcial: conviene revisar si faltaron repeticiones, carga o una serie específica.";
  }
  const planned = plannedVolume > 0 ? `${formatNumber(plannedVolume)} kg de volumen` : `${plannedReps} reps`;
  const actual = plannedVolume > 0 ? `${formatNumber(actualVolume)} kg` : `${actualReps} reps`;
  return `Quedó por debajo del plan: objetivo ${planned}, realizado ${actual}.`;
}

function getComplianceTone(value) {
  if (value >= 90) return { color: colors.success || "#10B981", label: "Cumplido" };
  if (value >= 70) return { color: colors.warning || "#F59E0B", label: "Parcial" };
  return { color: "#EF4444", label: "Bajo" };
}

function formatPlanReal(load, reps) {
  const loadText = load ? `${formatNumber(load)} kg` : "Libre";
  const repsText = reps ? `${reps} reps` : "- reps";
  return `${loadText} x ${repsText}`;
}

function formatDelta(row) {
  const loadDelta = row.planLoad ? row.actualLoad - row.planLoad : null;
  const repsDelta = row.planReps ? row.actualReps - row.planReps : null;
  const parts = [];
  if (loadDelta != null && loadDelta !== 0) parts.push(`${loadDelta > 0 ? "+" : ""}${formatNumber(loadDelta)} kg`);
  if (repsDelta != null && repsDelta !== 0) parts.push(`${repsDelta > 0 ? "+" : ""}${repsDelta} reps`);
  return parts.length ? parts.join(" / ") : "sin diferencia";
}

function toPercent(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 100);
}

function safeRatio(actual, planned) {
  if (!planned) return actual ? 1 : 0;
  return actual / planned;
}

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readLoad(value) {
  const text = String(value ?? "");
  if (!text || /libre/i.test(text)) return 0;
  return toNumber(text);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  floatingContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(109, 74, 255, 0.3)",
    backgroundColor: "rgba(109, 74, 255, 0.08)",
  },
  exerciseTitle: {
    ...typography.screenTitle,
    color: colors.text,
    fontSize: 28,
  },
  cardTitle: {
    ...typography.detailTitle,
  },
  planTitle: {
    ...typography.detailTitle,
    flex: 1,
  },
  helpTitle: {
    ...typography.metricValue,
  },
  helpText: {
    ...typography.sectionSubtitle,
  },
  rmEstimateBox: {
    gap: 7,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rmEstimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  rmEstimateTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  rmEstimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rmEstimateInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.45)",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  rmEstimateButton: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  rmEstimateButtonDisabled: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  rmEstimateClear: {
    width: 38,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  rmEstimateHelp: {
    color: colors.textSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  rmEstimateError: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "800",
  },
  reportSummaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  reportMetric: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  reportMetricValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  reportMetricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
  },
  reportSetLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "900",
  },
  reportStatus: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "900",
  },
  reportLine: {
    fontSize: 12,
    color: colors.textSoft,
    fontWeight: "700",
  },
  reportPercent: {
    fontSize: 16,
    fontWeight: "900",
  },
  reportDelta: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: "800",
    textAlign: "right",
  },
  reportNote: {
    marginTop: 12,
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  executionChartCard: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: 12,
    paddingHorizontal: 10,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  legendText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  reportObservation: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: 10,
  },
  reportObservationText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
