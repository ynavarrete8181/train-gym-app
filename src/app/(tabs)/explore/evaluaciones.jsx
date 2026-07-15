import { useCallback, useRef, useState } from "react";
import { Pressable, View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getEvaluaciones } from "../../../features/explore/exploreService";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import AppCard from "../../../components/common/AppCard";
import WebSemanticButton from "../../../components/common/WebSemanticButton";
import AppHeader from "../../../components/common/AppHeader";
import AppBadge from "../../../components/common/AppBadge";
import AppModal from "../../../components/common/AppModal";
import EmptyState from "../../../components/common/EmptyState";
import { getScreenBottomPadding } from "../../../theme/layout";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";

export default function EvaluacionesPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState(null);

  const loadEvaluaciones = useCallback(() => {
    setLoading(true);
    getEvaluaciones()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useRefreshOnFocus(scrollRef, loadEvaluaciones);

  if (loading && !data) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  const evaluaciones = data || [];

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="clipboard-pulse-outline"
        title="Evaluaciones Fisicas"
        subtitle="Control de rendimiento y valoraciones de estado."
        showBack
        showSettings
      />

      <ScrollView 
        ref={scrollRef} 
        contentContainerStyle={[appStyles.container, { gap: 20, paddingTop: 0, paddingBottom: getScreenBottomPadding(insets.bottom) }]} 
        style={styles.scrollArea}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEvaluaciones} tintColor={colors.primary} />}
      >
        {evaluaciones && evaluaciones.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial de evaluaciones</Text>
              <Text style={styles.sectionSubtitle}>Toca una evaluacion para revisar resultados y observaciones.</Text>
            </View>

            <View style={styles.list}>
              {evaluaciones.map((ev, index) => (
                <EvaluationCard
                  key={`${ev.id || ev.fecha_evaluacion || "evaluacion"}-${index}`}
                  item={ev}
                  active={selectedEval === ev}
                  onPress={() => setSelectedEval(ev)}
                />
              ))}
            </View>
          </>
        ) : (
          <EmptyState 
            icon="clipboard-pulse-outline"
            title="Sin evaluaciones" 
            subtitle="No tienes evaluaciones fisicas registradas todavia." 
          />
        )}
      </ScrollView>

      <AppModal
        visible={!!selectedEval}
        title="Detalle de evaluacion"
        subtitle={selectedEval ? formatDate(selectedEval.fecha_evaluacion) : ""}
        icon="clipboard-pulse-outline"
        onClose={() => setSelectedEval(null)}
        footer={
          <WebSemanticButton
            label="CERRAR"
            icon="close"
            tone="danger"
            onPress={() => setSelectedEval(null)}
            borderWidth={1.5}
          />
        }
      >
        {selectedEval && (
          <View style={{ gap: 18 }}>
            <View style={styles.modalHero}>
              <MaterialCommunityIcons name="clipboard-pulse-outline" size={24} color={getLevelStyle(selectedEval.nivel_resultado).color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Nivel / Estado</Text>
                <Text style={[styles.value, { color: getLevelStyle(selectedEval.nivel_resultado).color }]}>
                  {selectedEval.nivel_resultado || '-'}
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.label}>Tipo de evaluacion</Text>
              <Text style={styles.value}>{selectedEval.tipo_evaluacion || "Evaluacion fisica"}</Text>
            </View>

            <View>
              <Text style={styles.label}>Resumen</Text>
              <Text style={styles.textValue}>{selectedEval.resultado_resumen || 'Sin resumen'}</Text>
            </View>

            {selectedEval.observaciones ? (
              <View>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={[styles.textValue, { color: colors.textSoft }]}>{selectedEval.observaciones}</Text>
              </View>
            ) : null}

            {selectedEval.fecha_proxima_evaluacion ? (
              <View>
                <Text style={styles.label}>Proxima evaluacion</Text>
                <Text style={[styles.value, { color: colors.accent }]}>
                  {formatDate(selectedEval.fecha_proxima_evaluacion)}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </AppModal>
    </View>
  );
}

function EvaluationCard({ item, active, onPress }) {
  const levelStyle = getLevelStyle(item.nivel_resultado);

  return (
    <Pressable onPress={onPress}>
      <AppCard style={[styles.evaluationCard, { borderLeftColor: levelStyle.color }, active && styles.evaluationCardActive]}>
        <View style={styles.cardBody}>
          <DateTile value={item.fecha_evaluacion} />

          <View style={styles.cardInfo}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardDate}>Evaluacion {formatDate(item.fecha_evaluacion)}</Text>
              </View>
              <AppBadge tone={levelStyle.badgeTone}>{item.nivel_resultado || "Pendiente"}</AppBadge>
            </View>

            <Text style={styles.cardHint}>Toca para revisar el detalle completo</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <WebSemanticButton
            label="Ver detalle"
            icon="file-document-outline"
            tone="primary"
            onPress={onPress}
            size="small"
            borderWidth={1}
          />
        </View>
      </AppCard>
    </Pressable>
  );
}

function DateTile({ value }) {
  const date = parseDate(value);
  const day = date ? String(date.getDate()).padStart(2, "0") : "--";
  const month = date ? date.toLocaleDateString(undefined, { month: "short" }).replace(".", "") : "---";
  const year = date ? date.getFullYear() : "----";

  return (
    <View style={styles.dateTile}>
      <Text style={styles.dateTileDay}>{day}</Text>
      <Text style={styles.dateTileMonth}>{month}</Text>
      <Text style={styles.dateTileYear}>{year}</Text>
    </View>
  );
}

function getLevelStyle(level = "") {
  const normalized = String(level).toLowerCase();

  if (normalized.includes("excelente")) {
    return { color: colors.success, badgeTone: "success" };
  }

  if (normalized.includes("bueno")) {
    return { color: colors.info, badgeTone: "primary" };
  }

  if (normalized.includes("riesgo") || normalized.includes("bajo") || normalized.includes("deficiente")) {
    return { color: colors.danger, badgeTone: "danger" };
  }

  return { color: colors.warning, badgeTone: "warning" };
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : "-";
}

const styles = StyleSheet.create({
  scrollArea: {
    marginTop: -20,
    zIndex: 10,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    gap: 3,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontWeight: "800",
  },
  sectionSubtitle: {
    ...typography.sectionSubtitle,
    marginTop: 2,
  },
  list: {
    gap: 14,
  },
  evaluationCard: {
    gap: 12,
    padding: 14,
    borderLeftWidth: 6,
  },
  evaluationCardActive: {
    borderColor: colors.primary,
  },
  cardBody: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  dateTile: {
    width: 72,
    minHeight: 94,
    borderRadius: 8,
    backgroundColor: colors.primaryPale,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  dateTileDay: {
    fontSize: 27,
    color: colors.text,
    fontWeight: "900",
    lineHeight: 31,
  },
  dateTileMonth: {
    marginTop: 2,
    fontSize: 12,
    color: colors.primaryStrong,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dateTileYear: {
    marginTop: 1,
    fontSize: 11,
    color: colors.text,
    fontWeight: "800",
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardDate: {
    ...typography.itemTitle,
    fontSize: 16,
  },
  cardHint: {
    ...typography.itemSubtitle,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  label: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '800',
  },
  value: {
    ...typography.detailTitle,
    fontSize: 16,
    fontWeight: '900',
  },
  textValue: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text
  },
  modalHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    padding: 12,
  },
});
