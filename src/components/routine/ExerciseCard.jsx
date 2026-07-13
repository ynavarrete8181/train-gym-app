import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import AppCard from "../common/AppCard";
import ProgressChip from "./ProgressChip";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

import WebSemanticButton from "../common/WebSemanticButton";

export default function ExerciseCard({ item, planId, week, day, onExecute }) {
  const router = useRouter();
  const statusTone = getStatusTone(item.status);
  const completedSeries = item.ejecucion?.series?.filter((serie) => serie.completado)?.length || 0;

  return (
    <AppCard style={[styles.card, { borderLeftColor: statusTone.color }]}>
      <View style={styles.cardBody}>
        <View style={[styles.seriesTile, { backgroundColor: statusTone.background }]}>
          <Text style={styles.seriesTileValue}>{item.series || 0}</Text>
          <Text style={[styles.seriesTileLabel, { color: statusTone.color }]}>series</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleBox}>
              <Text style={styles.title}>{item.name}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
            <ProgressChip status={item.status} />
          </View>

          <View style={styles.metricsRow}>
            <MiniPlanMetric label="Plan" value={`${item.series || 0} x ${item.reps || "-"}`} />
            <MiniPlanMetric label="Objetivo" value={`${item.load || "Libre"}${item.rpe ? ` / RPE ${item.rpe}` : ""}`} />
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
          <WebSemanticButton 
            label="Secuencia"
            icon="play-circle-outline"
            tone={item.status === 'COMPLETADO' ? 'success' : 'neutral'}
            size="small"
            style={{ flex: 1 }}
            onPress={() => onExecute && onExecute()} 
          />
          <WebSemanticButton 
            label="Detalle"
            icon="eye-outline"
            tone="primary"
            size="small"
            style={{ flex: 1 }}
            onPress={() => router.push({
              pathname: `/exercise/${item.id}`,
              params: {
                series: item.series,
                reps: item.reps,
                load: item.load,
                rpe: item.rpe,
                plan_id: planId,
                plan_ejercicio_id: item.plan_ejercicio_id,
                week,
                day,
                status: item.status,
                planned_series: JSON.stringify(item.plannedSeries || []),
              }
            })} 
          />
        </View>
      </View>
    </AppCard>
  );
}

function MiniPlanMetric({ label, value }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricLabel}>{label}</Text>
      <Text style={styles.miniMetricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function getStatusTone(status) {
  switch (status) {
    case "COMPLETADO":
      return { color: colors.success, background: colors.successSoft };
    case "PARCIAL":
    case "EN_PROGRESO":
      return { color: colors.info, background: colors.blueSoft };
    case "OMITIDO":
      return { color: colors.danger, background: colors.dangerSoft };
    case "COMPLETADO_CON_AJUSTE":
      return { color: colors.warning, background: colors.yellowSoft };
    case "PENDIENTE":
    default:
      return { color: colors.primaryStrong, background: colors.primaryPale };
  }
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
    borderLeftWidth: 6,
  },
  cardBody: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  seriesTile: {
    width: 66,
    minHeight: 82,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  seriesTileValue: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "900",
    color: colors.text,
  },
  seriesTileLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  titleBox: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.itemTitle,
  },
  note: {
    ...typography.itemSubtitle,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniMetric: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniMetricLabel: {
    ...typography.metricLabel,
  },
  miniMetricValue: {
    ...typography.metricValue,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  executionBox: {
    flex: 1,
    minWidth: 0,
  },
  executionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  executionNote: {
    marginTop: 2,
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  executionMuted: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
});
