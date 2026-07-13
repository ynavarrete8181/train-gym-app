import { useCallback, useRef, useState, useEffect } from "react";
import { ScrollView, View, Dimensions, RefreshControl, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text } from "react-native-paper";
import { LineChart } from "react-native-gifted-charts";
import AppCard from "../../components/common/AppCard";
import AppHeader from "../../components/common/AppHeader";
import AppModal from "../../components/common/AppModal";
import EmptyState from "../../components/common/EmptyState";
import { getRoutineByDay } from "../../features/routine/routineService";
import { getProgressSummary } from "../../features/progress/progressService";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

const screenWidth = Dimensions.get("window").width;

export default function ProgressPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [noPlan, setNoPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todo'); // 'todo', 'semana_1', 'semana_2', 'mes'
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showComparisonHelp, setShowComparisonHelp] = useState(false);
  
  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const routineResponse = await getRoutineByDay();
      if (routineResponse.noPlan) {
        setNoPlan(true);
        setSummary(null);
      } else {
        setNoPlan(false);
        const data = await getProgressSummary(filter);
        setSummary(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary();
  }, [loadSummary]);

  useRefreshOnFocus(scrollRef, loadSummary, { skipInitial: true });

  if (loading && !summary && !noPlan) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  if (noPlan) {
    return (
      <View style={appStyles.screen}>
        <AppHeader
          icon="chart-line-variant"
          title="Evolución"
          subtitle="Tu rendimiento y consistencia."
          showSettings
          rounded
        />
        <EmptyState 
          icon="clipboard-text-off-outline"
          title="Sin datos de evolución"
          subtitle="Aún no tienes una asignación de plan activa para generar estadísticas de tu progreso."
        />
      </View>
    );
  }

  // Generate filter options dynamically based on totalWeeks
  const totalWeeks = summary?.totalWeeks || 4;
  const performance = summary?.performance || {};
  const hasLoadData = Boolean(performance.hasLoadData);
  const volumeEvolution = performance.volumeEvolution || [];
  const comparisonEvolution = performance.comparisonEvolution || [];
  const isRefreshingData = loading && Boolean(summary);
  const filterOptions = [];
  for (let i = 1; i <= totalWeeks; i++) {
    filterOptions.push({ id: `semana_${i}`, label: `Semana ${i}` });
  }
  filterOptions.push({ id: 'mes', label: 'Mes' });
  filterOptions.push({ id: 'todo', label: 'Todo el Plan' });

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="chart-line-variant"
        title="Evolución"
        subtitle="Tu rendimiento y consistencia."
        showSettings
        rounded
      />
      
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <TouchableOpacity 
                key={opt.id}
                disabled={isRefreshingData}
                onPress={() => {
                  if (filter !== opt.id) {
                    setSelectedWeek(null);
                    setSelectedExercise(null);
                    setFilter(opt.id);
                  }
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primary : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                  opacity: isRefreshingData && !isActive ? 0.58 : 1,
                }}
              >
                <Text style={{ 
                  color: isActive ? colors.surface : colors.textSoft, 
                  fontWeight: isActive ? "800" : "600",
                  fontSize: 13
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {isRefreshingData ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
            <ActivityIndicator animating color={colors.primary} size="small" />
            <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "800" }}>Actualizando reporte...</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[appStyles.container, { gap: 18, paddingTop: 18, paddingBottom: getScreenBottomPadding(insets.bottom, 20) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} tintColor={colors.primary} />}
      >
        {isRefreshingData ? <InlineLoadingCard label="Consultando datos de ejecución" /> : null}

        <AppCard>
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
                  Reporte de Peso y Repeticiones
                </Text>
                <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "700" }}>
                  {hasLoadData
                    ? "Resumen de lo que moviste según las secuencias registradas."
                    : "Por ahora solo hay repeticiones. Cuando registres kg, aparecerán carga y volumen."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowComparisonHelp(true)}
                activeOpacity={0.82}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                <MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.primaryStrong} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <MetricChip icon="repeat" label="Reps" value={formatCompact(performance.totalReps)} color={colors.accent} />
              <MetricChip icon="target" label="Plan reps" value={formatCompact(performance.plannedReps)} color="#10B981" />
              <MetricChip icon="percent" label="Cumpl." value={`${performance.repsCompliance || 0}%`} color={getComplianceColor(performance.repsCompliance)} />
              <MetricChip
                icon="weight-kilogram"
                label="Carga prom."
                value={hasLoadData ? `${formatCompact(performance.averageLoad)} kg` : "Sin carga"}
                color={colors.primaryStrong}
              />
              <MetricChip
                icon="arm-flex"
                label="Mayor carga"
                value={hasLoadData ? `${formatCompact(performance.maxLoad)} kg` : "Sin carga"}
                color={colors.warning}
              />
              {hasLoadData ? (
                <MetricChip icon="chart-areaspline" label="Volumen" value={`${formatCompact(performance.totalVolume)} kg`} color={colors.success || "#10B981"} />
              ) : null}
            </View>

            {hasLoadData ? (
              <View style={{ alignItems: "center", marginTop: 6, marginLeft: -10 }}>
                <LineChart
                  data={volumeEvolution.map((item) => ({
                    ...item,
                    dataPointText: formatCompact(item.value),
                  }))}
                  color={colors.primary}
                  thickness={3}
                  dataPointsColor={colors.accent}
                  dataPointsRadius={5}
                  hideRules
                  xAxisThickness={1}
                  xAxisColor={colors.border}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: colors.textSoft, fontSize: 11 }}
                  noOfSections={4}
                  maxValue={getChartMax(volumeEvolution)}
                  height={120}
                  width={screenWidth - 120}
                  curved
                  areaChart
                  startFillColor={colors.primaryPale}
                  endFillColor="rgba(255,255,255,0.01)"
                  startOpacity={0.35}
                  endOpacity={0.08}
                />
              </View>
            ) : null}
          </View>
        </AppCard>

        <ComparisonBars
          data={comparisonEvolution}
          onSelect={(item) => {
            setSelectedWeek(item);
            setSelectedExercise(null);
          }}
        />
      </ScrollView>

      <WeekDetailModal
        week={selectedWeek}
        exercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
        onBackExercise={() => setSelectedExercise(null)}
        onClose={() => {
          setSelectedWeek(null);
          setSelectedExercise(null);
        }}
        loading={isRefreshingData}
      />

      <ComparisonHelpModal visible={showComparisonHelp} onClose={() => setShowComparisonHelp(false)} />
    </View>
  );
}

function ComparisonHelpModal({ visible, onClose }) {
  return (
    <AppModal
      visible={visible}
      title="Plan vs Secuencia"
      subtitle="Cómo leer el reporte"
      icon="help-circle-outline"
      onClose={onClose}
    >
      <View style={{ gap: 12 }}>
        <HelpRow color="#10B981" title="Plan" text="Es lo que el entrenador dejó programado para la semana." />
        <HelpRow color="#EF4444" title="Secuencia" text="Es lo que registraste realmente al ejecutar el ejercicio." />
        <HelpRow color={colors.primaryStrong} title="Cumplimiento" text="Compara tus repeticiones registradas contra las repeticiones del plan." />
      </View>
    </AppModal>
  );
}

function HelpRow({ color, title, text }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginTop: 5 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "700", lineHeight: 17 }}>{text}</Text>
      </View>
    </View>
  );
}

function MetricChip({ icon, label, value, color }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
      }}
    >
      <MaterialCommunityIcons name={icon} size={16} color={color} />
      <Text style={{ color: colors.textSoft, fontSize: 11, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function ComparisonBars({ data, onSelect }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const maxReps = Math.max(...data.flatMap((item) => [Number(item.plannedReps || 0), Number(item.actualReps || 0)]), 1);

  return (
    <View style={{ gap: 12 }}>
      {data.map((item) => {
        const planned = Number(item.plannedReps || 0);
        const actual = Number(item.actualReps || 0);
        const percent = planned > 0 ? Math.round((actual / planned) * 100) : 0;

        return (
          <AppCard key={item.label} style={{ padding: 14 }}>
            <TouchableOpacity onPress={() => onSelect?.(item)} style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.surfaceAlt,
                    }}
                  >
                    <MaterialCommunityIcons name="calendar-week" size={18} color={colors.primaryStrong} />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "900" }}>{item.label}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ color: getComplianceColor(percent), fontSize: 14, fontWeight: "900" }}>{percent}%</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
                </View>
              </View>
              <MetricBar label="Plan" value={planned} max={maxReps} color="#10B981" />
              <MetricBar label="Secuencia" value={actual} max={maxReps} color="#EF4444" />
            </TouchableOpacity>
          </AppCard>
        );
      })}
    </View>
  );
}

function InlineLoadingCard({ label }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
      }}
    >
      <ActivityIndicator animating color={colors.primary} size="small" />
      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function WeekDetailModal({ week, exercise, onSelectExercise, onBackExercise, onClose, loading }) {
  if (!week) return null;

  const planned = Number(week.plannedReps || 0);
  const actual = Number(week.actualReps || 0);
  const compliance = planned > 0 ? Math.round((actual / planned) * 100) : 0;
  const groupedExercises = groupExercisesByName(week.exercises || []);

  return (
    <AppModal
      visible={Boolean(week)}
      title={exercise ? exercise.name : `Detalle ${week.label}`}
      subtitle={exercise ? "Series planificadas vs ejecutadas" : "Ejercicios de la semana"}
      icon={exercise ? "dumbbell" : "calendar-week"}
      onClose={onClose}
    >
      {loading ? (
        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 12 }}>
          <ActivityIndicator animating color={colors.primary} />
          <Text style={{ color: colors.textSoft, fontSize: 13, fontWeight: "800" }}>Actualizando detalle...</Text>
        </View>
      ) : exercise ? (
        <ExerciseSeriesDetail exercise={exercise} onBack={onBackExercise} />
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <MetricChip icon="target" label="Plan" value={`${formatCompact(planned)} reps`} color="#10B981" />
            <MetricChip icon="repeat" label="Secuencia" value={`${formatCompact(actual)} reps`} color="#EF4444" />
            <MetricChip icon="percent" label="Cumpl." value={`${compliance}%`} color={getComplianceColor(compliance)} />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 10,
              borderRadius: 12,
              backgroundColor: "#F8FAFC",
            }}
          >
            <MaterialCommunityIcons name="gesture-tap" size={18} color={colors.primaryStrong} />
            <Text style={{ flex: 1, color: colors.textSoft, fontSize: 12, fontWeight: "800" }}>
              Desliza para ver más ejercicios y toca un día para abrir sus series.
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            {groupedExercises.map((group) => (
              <View
                key={group.name}
                style={{
                  gap: 10,
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{group.name}</Text>
                    <Text style={{ color: colors.textSoft, fontSize: 11, fontWeight: "700" }}>
                      {group.items.length} {group.items.length === 1 ? "aparición" : "apariciones"} en la semana
                    </Text>
                  </View>
                  <Text style={{ color: getComplianceColor(group.compliance), fontSize: 13, fontWeight: "900" }}>
                    {group.compliance}%
                  </Text>
                </View>

                {group.items.map((item, index) => {
                  const itemCompliance = Number(item.compliance || 0);
                  const itemKey = `${item.id}-${item.day || "dia"}-${index}`;
                  return (
                    <TouchableOpacity
                      key={itemKey}
                      onPress={() => onSelectExercise(item)}
                      style={{
                        gap: 8,
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: colors.surfaceAlt,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>{formatDayLabel(item.day)}</Text>
                          <Text style={{ color: colors.textSoft, fontSize: 11, fontWeight: "700" }}>
                            Plan {formatCompact(item.plannedReps)} reps / Secuencia {formatCompact(item.actualReps)} reps
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 4 }}>
                          <Text style={{ color: getComplianceColor(itemCompliance), fontSize: 12, fontWeight: "900" }}>{itemCompliance}%</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <Text style={{ color: colors.primaryStrong, fontSize: 10, fontWeight: "900" }}>Ver series</Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primaryStrong} />
                          </View>
                        </View>
                      </View>
                      <MetricBar label="Plan" value={item.plannedReps} max={Math.max(item.plannedReps, item.actualReps, 1)} color="#10B981" />
                      <MetricBar label="Secuencia" value={item.actualReps} max={Math.max(item.plannedReps, item.actualReps, 1)} color="#EF4444" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}
    </AppModal>
  );
}

function groupExercisesByName(exercises) {
  const groups = new Map();

  exercises.forEach((item) => {
    const name = item.name || "Ejercicio";
    const group = groups.get(name) || {
      name,
      items: [],
      plannedReps: 0,
      actualReps: 0,
      compliance: 0,
    };

    group.items.push(item);
    group.plannedReps += Number(item.plannedReps || 0);
    group.actualReps += Number(item.actualReps || 0);
    group.compliance = group.plannedReps > 0 ? Math.round((group.actualReps / group.plannedReps) * 100) : 0;
    groups.set(name, group);
  });

  return Array.from(groups.values());
}

function formatDayLabel(day) {
  if (!day) return "Día planificado";
  return String(day).charAt(0).toUpperCase() + String(day).slice(1);
}

function ExerciseSeriesDetail({ exercise, onBack }) {
  const maxRows = Math.max(exercise.plannedSeries?.length || 0, exercise.actualSeries?.length || 0);
  const rows = Array.from({ length: maxRows }).map((_, index) => {
    const planned = exercise.plannedSeries?.[index] || {};
    const actual = (exercise.actualSeries || []).find((item) => Number(item.number) === index + 1) || exercise.actualSeries?.[index] || {};
    return {
      number: index + 1,
      plannedLoad: Number(planned.load || 0),
      plannedReps: Number(planned.reps || 0),
      actualLoad: Number(actual.load || 0),
      actualReps: Number(actual.reps || 0),
    };
  });

  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primaryStrong} />
        <Text style={{ color: colors.primaryStrong, fontSize: 13, fontWeight: "900" }}>Volver a ejercicios</Text>
      </TouchableOpacity>

      {rows.map((row) => {
        const plannedVolume = row.plannedLoad * row.plannedReps;
        const actualVolume = row.actualLoad * row.actualReps;
        const percent = plannedVolume > 0 ? Math.round((actualVolume / plannedVolume) * 100) : (row.plannedReps > 0 ? Math.round((row.actualReps / row.plannedReps) * 100) : 0);

        return (
          <View
            key={row.number}
            style={{
              gap: 8,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>Serie {row.number}</Text>
              <Text style={{ color: getComplianceColor(percent), fontSize: 12, fontWeight: "900" }}>{percent}%</Text>
            </View>
            <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "800" }}>
              Plan: {formatLoadReps(row.plannedLoad, row.plannedReps)}
            </Text>
            <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "800" }}>
              Secuencia: {formatLoadReps(row.actualLoad, row.actualReps)}
            </Text>
          </View>
        );
      })}

      {exercise.observation ? (
        <View style={{ flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, backgroundColor: "#F8FAFC" }}>
          <MaterialCommunityIcons name="note-text-outline" size={18} color={colors.primaryStrong} />
          <Text style={{ flex: 1, color: colors.textSoft, fontSize: 12, fontWeight: "700", lineHeight: 18 }}>{exercise.observation}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MetricBar({ label, value, max, color }) {
  const width = `${Math.max(4, Math.min(100, (Number(value || 0) / max) * 100))}%`;

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: colors.textSoft, fontSize: 11, fontWeight: "800" }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: 11, fontWeight: "900" }}>{formatCompact(value)} reps</Text>
      </View>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: "#E2E8F0", overflow: "hidden" }}>
        <View style={{ width, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
    </View>
  );
}

function formatCompact(value) {
  const numeric = Number(value || 0);
  if (numeric >= 1000) {
    return `${(numeric / 1000).toFixed(numeric >= 10000 ? 0 : 1)}k`;
  }
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
}

function formatLoadReps(load, reps) {
  const loadText = load > 0 ? `${formatCompact(load)} kg` : "Libre";
  return `${loadText} x ${formatCompact(reps)} reps`;
}

function getComplianceColor(value) {
  const numeric = Number(value || 0);
  if (numeric >= 90) return colors.success || "#10B981";
  if (numeric >= 70) return colors.warning || "#F59E0B";
  return "#EF4444";
}

function getChartMax(data) {
  const max = Math.max(...(data || []).map((item) => Number(item.value || 0)), 0);
  if (max <= 0) return 10;
  return Math.ceil(max * 1.2);
}
