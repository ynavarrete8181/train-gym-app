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
        title="Progreso físico"
        subtitle="Tus medidas corporales y su evolución."
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
              <Text style={styles.sectionTitle}>Historial de controles</Text>
              <Text style={styles.sectionSubtitle}>Toca un control para revisar todas tus medidas.</Text>
            </View>

            <View style={styles.list}>
              {evaluaciones.map((ev, index) => (
                <EvaluationCard
                  key={`${ev.id || ev.fecha_registro || ev.fecha_ficha || "control"}-${index}`}
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
            title="Sin controles físicos" 
            subtitle="Cuando el gimnasio registre tus medidas, aquí aparecerá tu evolución." 
          />
        )}
      </ScrollView>

      <AppModal
        visible={!!selectedEval}
        title="Detalle del control físico"
        subtitle={selectedEval ? formatDate(selectedEval.fecha_registro || selectedEval.fecha_ficha) : ""}
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
              <MaterialCommunityIcons name="scale-bathroom" size={24} color={colors.primaryStrong} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Peso registrado</Text>
                <Text style={[styles.value, { color: colors.primaryStrong }]}>{formatUnit(selectedEval.peso_kg, "kg")}</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <DetailMetric label="Estatura" value={formatUnit(selectedEval.talla_cm, "cm")} />
              <DetailMetric label="IMC" value={formatNumber(selectedEval.imc)} />
              <DetailMetric label="Cintura" value={formatUnit(selectedEval.cintura_cm, "cm")} />
              <DetailMetric label="Grasa corporal" value={formatUnit(selectedEval.grasa_corporal_pct, "%")} />
              <DetailMetric label="Masa magra" value={formatUnit(selectedEval.masa_magra_kg, "kg")} />
              <DetailMetric label="Cintura / altura" value={formatNumber(selectedEval.cintura_altura, 3)} />
            </View>

            <View><Text style={styles.label}>Objetivo</Text><Text style={styles.textValue}>{selectedEval.objetivo || "No especificado"}</Text></View>

            {selectedEval.observaciones ? (
              <View>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={[styles.textValue, { color: colors.textSoft }]}>{selectedEval.observaciones}</Text>
              </View>
            ) : null}

          </View>
        )}
      </AppModal>
    </View>
  );
}

function EvaluationCard({ item, active, onPress }) {
  const levelStyle = getImcStyle(item.imc);

  return (
    <Pressable onPress={onPress}>
      <AppCard style={[styles.evaluationCard, { borderLeftColor: levelStyle.color }, active && styles.evaluationCardActive]}>
        <View style={styles.cardBody}>
          <DateTile value={item.fecha_registro || item.fecha_ficha} />

          <View style={styles.cardInfo}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardDate}>Control {formatDate(item.fecha_registro || item.fecha_ficha)}</Text>
              </View>
              <AppBadge tone={levelStyle.badgeTone}>IMC {formatNumber(item.imc)}</AppBadge>
            </View>
            <View style={styles.cardMetrics}><Text style={styles.cardMetric}>{formatUnit(item.peso_kg, "kg")}</Text><Text style={styles.cardMetric}>{formatUnit(item.grasa_corporal_pct, "% grasa")}</Text></View>
            <Text style={styles.cardHint}>Toca para revisar todas las medidas</Text>
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

function getImcStyle(value) {
  const imc = Number(value);
  if (imc >= 18.5 && imc < 25) return { color: colors.success, badgeTone: "success" };
  if (imc >= 25 && imc < 30) return { color: colors.warning, badgeTone: "warning" };
  return { color: colors.info, badgeTone: "primary" };
}

function DetailMetric({ label, value }) {
  return <View style={styles.detailMetric}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

function formatNumber(value, digits = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "-";
}

function formatUnit(value, unit) {
  return value == null ? "-" : `${formatNumber(value)} ${unit}`;
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
  cardMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cardMetric: { fontSize: 12, fontWeight: "900", color: colors.primaryStrong, backgroundColor: colors.primaryPale, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
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
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailMetric: { width: "47%", padding: 10, borderRadius: 8, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
});
