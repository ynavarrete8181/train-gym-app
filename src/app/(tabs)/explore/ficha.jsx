import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFichas } from "../../../features/explore/exploreService";
import { normalizeAssetUrl } from "../../../api/apiClient";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import AppCard from "../../../components/common/AppCard";
import AppHeader from "../../../components/common/AppHeader";
import AppBadge from "../../../components/common/AppBadge";
import AppModal from "../../../components/common/AppModal";
import WebSemanticButton from "../../../components/common/WebSemanticButton";

const demoBodyPhotoUrl = "https://thumbs.wbm.im/pw/medium/9058727efd2f9f8b4e59512c715bb1e1.png";

export default function FichaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailFicha, setDetailFicha] = useState(null);
  const [formulaFicha, setFormulaFicha] = useState(null);

  useEffect(() => {
    getFichas()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { ficha, evaluaciones = [] } = data || {};
  const fichas = useMemo(() => {
    const list = evaluaciones?.length ? evaluaciones : ficha ? [ficha] : [];

    return list
      .slice()
      .sort((a, b) => new Date(b.fecha_ficha || b.fecha_actualizacion || 0) - new Date(a.fecha_ficha || a.fecha_actualizacion || 0))
      .map((item, index, sorted) => ({
        ...item,
        tendencia: buildTrend(item, sorted[index + 1]),
      }));
  }, [evaluaciones, ficha]);

  if (loading) {
    return (
      <View style={[appStyles.screen, styles.centered]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="clipboard-text-outline"
        title="Mi Ficha"
        subtitle="Historial corporal, avances y revision de medidas."
        showBack
        showSettings
      />

      <ScrollView contentContainerStyle={[appStyles.container, styles.content]} showsVerticalScrollIndicator={false}>
        {fichas.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial de fichas</Text>
              <Text style={styles.historySubtitle}>Toca una ficha para ver el detalle completo.</Text>
            </View>

            {fichas.map((item, index) => (
              <FichaHistoryCard
                key={`${item.id || item.fecha_ficha || "ficha"}-${index}`}
                ficha={item}
                active={detailFicha === item}
                onPress={() => setDetailFicha(item)}
                onDetail={() => setDetailFicha(item)}
                onFormula={() => setFormulaFicha(item)}
              />
            ))}
          </>
        ) : (
          <AppCard style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-plus-outline" size={42} color={colors.primary} />
            <Text style={styles.emptyTitle}>Aun no tienes ficha registrada</Text>
            <Text style={styles.emptyText}>Cuando el gimnasio registre tus medidas, aqui veras tu evolucion.</Text>
          </AppCard>
        )}
      </ScrollView>

      <FichaDetailModal
        ficha={detailFicha}
        visible={Boolean(detailFicha)}
        onClose={() => setDetailFicha(null)}
        onFormula={() => setFormulaFicha(detailFicha)}
      />

      <FormulaModal ficha={formulaFicha} visible={Boolean(formulaFicha)} onClose={() => setFormulaFicha(null)} />
    </View>
  );
}

function FichaHistoryCard({ ficha, active, onPress, onDetail, onFormula }) {
  const estado = getEstado(ficha);
  const estadoStyle = getEstadoStyle(estado.tono);
  const trend = ficha.tendencia;

  return (
    <Pressable onPress={onPress}>
      <AppCard style={[styles.historyCard, { borderLeftColor: estadoStyle.color }, active && styles.historyCardActive]}>
        <View style={styles.historyCardBody}>
          <DateTile value={ficha.fecha_ficha || ficha.fecha_actualizacion} />
          <View style={styles.historyInfo}>
            <View style={styles.historyTop}>
              <View style={styles.historyDateBox}>
                <Text style={styles.historyDate}>Revision {formatDate(ficha.fecha_ficha || ficha.fecha_actualizacion)}</Text>
              </View>
              <AppBadge tone={estadoStyle.badgeTone}>{estado.label}</AppBadge>
            </View>

            <Text style={styles.historyTitle}>{estado.titulo}</Text>

            <View style={styles.historyMetrics}>
              <MiniMetric label="Peso" value={formatUnit(ficha.peso_kg, "kg")} />
              <MiniMetric label="IMC" value={formatPlain(ficha.imc)} />
            </View>
          </View>
        </View>

        <View style={styles.historyBottom}>
          <View style={styles.trendRow}>
            <WebSemanticButton
              label={trend.label}
              icon={trend.icon}
              tone={trend.tone}
              size="small"
            />
          </View>
          <WebSemanticButton
            icon="calculator-variant-outline"
            tone="neutral"
            onPress={onFormula}
            size="small"
          />
          <WebSemanticButton
            label="Ver detalle"
            icon="eye"
            tone="primary"
            onPress={onDetail}
            size="small"
          />
        </View>
      </AppCard>
    </Pressable>
  );
}

function DateTile({ value }) {
  const date = value ? new Date(value) : null;
  const valid = date && !Number.isNaN(date.getTime());
  const day = valid ? String(date.getDate()).padStart(2, "0") : "--";
  const month = valid ? date.toLocaleDateString(undefined, { month: "short" }).replace(".", "") : "---";
  const year = valid ? date.getFullYear() : "----";

  return (
    <View style={styles.dateTile}>
      <Text style={styles.dateTileDay}>{day}</Text>
      <Text style={styles.dateTileMonth}>{month}</Text>
      <Text style={styles.dateTileYear}>{year}</Text>
    </View>
  );
}

function FichaDetailModal({ ficha, visible, onClose, onFormula }) {
  if (!ficha) return null;

  const estado = getEstado(ficha);
  const estadoStyle = getEstadoStyle(estado.tono);
  const bodyPhotoUrl = normalizeAssetUrl(ficha?.foto_url) || demoBodyPhotoUrl;

  return (
    <AppModal
      visible={visible}
      title="Detalle de ficha"
      subtitle={formatDate(ficha.fecha_ficha || ficha.fecha_actualizacion)}
      icon="clipboard-text-outline"
      onClose={onClose}
      footer={
        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="close" size={18} color={colors.danger} />
            <Text style={styles.btnCancelText}>Cerrar</Text>
          </View>
        </TouchableOpacity>
      }
    >
      <RotatingBodyPhoto ficha={ficha} imageUrl={bodyPhotoUrl} estadoStyle={estadoStyle} estadoLabel={estado.label} />
      <MetricGrid ficha={ficha} />
      <InfoRow icon="target" label="Objetivo" value={ficha.objetivo || "No especificado"} />
      <InfoRow icon="lightning-bolt" label="Actividad" value={ficha.actividad_fisica || "No especificado"} />
      <InfoRow icon="medical-bag" label="Observaciones" value={ficha.observaciones || "Ninguna observacion registrada."} />
      <InfoRow icon="calendar-clock" label="Proxima revision" value={formatDate(ficha.fecha_revision_sugerida)} />
    </AppModal>
  );
}

function RotatingBodyPhoto({ ficha, imageUrl, estadoStyle, estadoLabel, compact = false, card = false, showLabels = true }) {
  const [rotation] = useState(() => new Animated.Value(0));
  const rotateY = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["0deg", "180deg", "360deg"],
      }),
    [rotation]
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 6200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loop.start();

    return () => loop.stop();
  }, [rotation]);

  return (
    <View style={[styles.bodyVisual, compact && styles.bodyVisualCompact, card && styles.bodyVisualCard]}>
      <Animated.View style={[styles.bodyStage, card && styles.bodyStageCard, { transform: [{ perspective: 900 }, { rotateY }] }]}>
        <Image source={{ uri: imageUrl }} style={styles.bodyImage} resizeMode="contain" />
      </Animated.View>
      <View style={[styles.bodyBadge, { backgroundColor: estadoStyle.background, borderColor: estadoStyle.border }]}>
        <Text style={[styles.bodyBadgeText, { color: estadoStyle.color }]}>{estadoLabel}</Text>
      </View>
      {showLabels && (
        <>
          <MeasureLabel style={styles.measureHeight} label="Talla" value={formatUnit(ficha.talla_cm, "cm")} />
          <MeasureLabel style={styles.measureWaist} label="Cintura" value={formatUnit(ficha.cintura_cm, "cm")} />
          <MeasureLabel style={styles.measureFat} label="Grasa" value={formatUnit(ficha.grasa_corporal_pct, "%")} />
          <MeasureLabel style={styles.measureWeight} label="Peso" value={formatUnit(ficha.peso_kg, "kg")} />
        </>
      )}
    </View>
  );
}

function MeasureLabel({ label, value, style }) {
  return (
    <View style={[styles.measureLabel, style]}>
      <Text style={styles.measureLabelTitle}>{label}</Text>
      <Text style={styles.measureLabelValue}>{value}</Text>
    </View>
  );
}

function MetricGrid({ ficha }) {
  return (
    <View style={styles.metricPills}>
      <MetricPill label="IMC" value={formatPlain(ficha.imc)} />
      <MetricPill label="Cintura/Altura" value={formatPlain(ficha.cintura_altura)} />
      <MetricPill label="Grasa" value={formatUnit(ficha.grasa_corporal_pct, "%")} />
      <MetricPill label="Masa magra" value={formatUnit(ficha.masa_magra_kg, "kg")} />
    </View>
  );
}

function MetricPill({ label, value }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricPillLabel}>{label}</Text>
      <Text style={styles.metricPillValue}>{value}</Text>
    </View>
  );
}

function MiniMetric({ label, value }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricLabel}>{label}</Text>
      <Text style={styles.miniMetricValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.headerCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

function FormulaModal({ ficha, visible, onClose }) {
  return (
    <AppModal
      visible={visible}
      title="Como se calculo"
      subtitle="Formulas usadas con las medidas registradas."
      icon="calculator-variant-outline"
      onClose={onClose}
      footer={
        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="close" size={18} color={colors.danger} />
            <Text style={styles.btnCancelText}>Cerrar</Text>
          </View>
        </TouchableOpacity>
      }
    >
      <FormulaLine item={ficha?.formula_calculo?.imc} fallback="IMC = peso kg / (talla m x talla m)." />
      <FormulaLine item={ficha?.formula_calculo?.masa_magra} fallback="Masa magra = peso kg x (1 - grasa corporal / 100)." />
      <FormulaLine item={ficha?.formula_calculo?.cintura_altura} fallback="Cintura/altura = cintura cm / talla cm." />
    </AppModal>
  );
}

function FormulaLine({ item, fallback }) {
  return (
    <View style={styles.formulaLine}>
      <Text style={styles.modalText}>{item?.formula || fallback}</Text>
      {item?.resultado != null && <Text style={styles.formulaResult}>{item.resultado}</Text>}
    </View>
  );
}

function getEstado(ficha) {
  return ficha?.estado_nutricional || {
    label: "Sin datos",
    tono: "dark",
    icono: "calculator-variant-outline",
    titulo: "Completa tu ficha",
    mensaje: "Cuando registres peso y talla se calculara tu estado nutricional.",
    accion: "Registrar mediciones para iniciar el seguimiento.",
  };
}

function buildTrend(current, previous) {
  if (!previous?.peso_kg || !current?.peso_kg) {
    return { label: "Primera referencia", icon: "timeline-clock-outline", tone: "neutral" };
  }

  const diff = Number(current.peso_kg) - Number(previous.peso_kg);

  if (Math.abs(diff) < 0.2) {
    return { label: "Peso estable", icon: "minus-circle-outline", tone: "neutral" };
  }

  if (diff > 0) {
    return { label: `Subio ${diff.toFixed(1)} kg`, icon: "arrow-up-bold-circle-outline", tone: "mustard" };
  }

  return { label: `Bajo ${Math.abs(diff).toFixed(1)} kg`, icon: "arrow-down-bold-circle-outline", tone: "success" };
}

function getEstadoStyle(tone) {
  if (tone === "success") {
    return { color: colors.success, background: "rgba(46, 125, 50, 0.10)", border: "rgba(46, 125, 50, 0.35)", iconBg: "rgba(46, 125, 50, 0.14)", badgeTone: "success" };
  }
  if (tone === "danger") {
    return { color: colors.danger, background: "rgba(220, 38, 38, 0.10)", border: "rgba(220, 38, 38, 0.35)", iconBg: "rgba(220, 38, 38, 0.14)", badgeTone: "danger" };
  }
  if (tone === "warning") {
    return { color: colors.warning, background: "rgba(242, 177, 0, 0.12)", border: "rgba(242, 177, 0, 0.45)", iconBg: "rgba(242, 177, 0, 0.18)", badgeTone: "warning" };
  }
  return { color: colors.text, background: "rgba(15, 23, 42, 0.06)", border: "rgba(15, 23, 42, 0.16)", iconBg: "rgba(15, 23, 42, 0.08)", badgeTone: "neutral" };
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function formatPlain(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatUnit(value, unit) {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${unit === "%" ? "" : " "}${unit}`;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  darkHeader: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    lineHeight: 19,
  },
  content: {
    gap: 14,
    paddingVertical: 24,
  },
  statusCard: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  statusIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    marginTop: 4,
    fontWeight: "600",
  },
  statusFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusAction: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  calcButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.white,
  },
  calcButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  bodyVisual: {
    height: 420,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bodyVisualCompact: {
    height: 360,
  },
  bodyVisualCard: {
    width: 96,
    height: 138,
    borderRadius: 12,
    flexShrink: 0,
  },
  bodyStage: {
    width: 174,
    height: 330,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bodyStageCard: {
    width: 68,
    height: 112,
  },
  bodyImage: {
    width: "100%",
    height: "100%",
  },
  bodyBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bodyBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  measureLabel: {
    position: "absolute",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 2,
  },
  measureLabelTitle: {
    fontSize: 9,
    color: colors.primaryStrong,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  measureLabelValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "900",
  },
  measureHeight: {
    right: 16,
    top: 74,
  },
  measureFat: {
    left: 14,
    top: 116,
  },
  measureWaist: {
    left: 14,
    top: 210,
  },
  measureWeight: {
    left: 14,
    bottom: 50,
  },
  metricPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricPill: {
    minWidth: "47%",
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  metricPillLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.textSoft,
    textTransform: "uppercase",
  },
  metricPillValue: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    gap: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  historySubtitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  historyCard: {
    gap: 10,
    padding: 14,
    borderLeftWidth: 6,
  },
  historyCardActive: {
    borderColor: colors.primary,
  },
  historyCardBody: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  dateTile: {
    width: 72,
    minHeight: 94,
    borderRadius: 16,
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
  historyInfo: {
    flex: 1,
    gap: 8,
  },
  historyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  historyDateBox: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  reviewDate: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "700",
  },
  stateBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  historyText: {
    fontSize: 12,
    color: colors.textSoft,
    lineHeight: 17,
    fontWeight: "600",
  },
  historyMetrics: {
    flexDirection: "row",
    gap: 8,
  },
  miniMetric: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniMetricLabel: {
    fontSize: 9,
    color: colors.textSoft,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  miniMetricValue: {
    marginTop: 2,
    fontSize: 14,
    color: colors.text,
    fontWeight: "900",
  },
  historyBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  trendRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "900",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  iconActionButton: {
    width: 38,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  detailButtonText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.08)",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: "center",
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "900",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textSoft,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  detailModal: {
    width: "100%",
    maxHeight: "92%",
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 16,
    gap: 12,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  detailScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  modalSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSoft,
    fontWeight: "700",
  },
  modalText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft,
    fontWeight: "600",
  },
  formulaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.08)",
    paddingBottom: 8,
  },
  formulaResult: {
    minWidth: 58,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
  },
  modalButton: {
    marginTop: 4,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  modalButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
  btnCancel: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
