import { useCallback, useRef, useState, useMemo } from "react";
import { Image, View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Text, ActivityIndicator, Searchbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getRMs } from "../../../features/explore/exploreService";
import { normalizeAssetUrl } from "../../../api/apiClient";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import AppCard from "../../../components/common/AppCard";
import AppHeader from "../../../components/common/AppHeader";
import EmptyState from "../../../components/common/EmptyState";
import AppBadge from "../../../components/common/AppBadge";
import { getScreenBottomPadding } from "../../../theme/layout";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";

export default function RMsPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [rms, setRms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadRms = useCallback(() => {
    setLoading(true);
    getRMs()
      .then(setRms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useRefreshOnFocus(scrollRef, loadRms);

  const filteredRms = useMemo(() => {
    if (!rms) return [];
    if (!searchQuery) return rms;
    const lowerQuery = searchQuery.toLowerCase();
    return rms.filter((rm) => rm.ejercicio && rm.ejercicio.toLowerCase().includes(lowerQuery));
  }, [rms, searchQuery]);

  if (loading && !rms) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="weight-lifter"
        title="Mis RMs"
        subtitle="Tus marcas de fuerza por ejercicio."
        showBack
        showSettings
      />

      <ScrollView 
        ref={scrollRef} 
        contentContainerStyle={[appStyles.container, { gap: 16, paddingTop: 18, paddingBottom: getScreenBottomPadding(insets.bottom, 28) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRms} tintColor={colors.primary} />}
      >
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View><Text style={styles.summaryValue}>{rms?.length || 0}</Text><Text style={styles.summaryLabel}>registros RM</Text></View>
            <View style={styles.summaryDivider} />
            <View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Tus cargas de entrenamiento</Text><Text style={styles.summaryText}>Consulta tu 1RM estimado y el peso correspondiente a cada porcentaje.</Text></View>
          </View>
        </AppCard>

        <Searchbar
          placeholder="Buscar ejercicio..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
          inputStyle={{ color: colors.text }}
        />

        <View style={{ gap: 12 }}>
          {filteredRms.length > 0 ? (
            filteredRms.map((rm, index) => (
              <AppCard key={index} style={styles.recordCard}>
                <View style={styles.recordItem}>
                  <ExerciseVisual rm={rm} />
                  <View style={styles.recordInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.ejercicio} numberOfLines={2}>{rm.ejercicio || "Desconocido"}</Text>
                      <AppBadge tone="purple">RM estimado</AppBadge>
                    </View>
                    <Text style={styles.rmValue}>{formatNumber(rm.rm_estimado)} <Text style={styles.rmUnit}>kg</Text></Text>
                    <Text style={styles.lbValue}>{formatNumber(rm.rm_estimado_lb || Number(rm.rm_estimado) * 2.2046226218)} lb</Text>
                    <View style={styles.badgesRow}>
                      <View>
                        <Text style={styles.metaValue}>{rm.repeticiones_usadas || rm.repeticiones || "-"} reps</Text>
                        <Text style={styles.metaLabel}>Repeticiones</Text>
                      </View>
                      <View style={styles.dateMeta}>
                        <Text style={styles.metaValue}>{formatDate(rm.fecha_registro)}</Text>
                        <Text style={styles.metaLabel}>Fecha</Text>
                      </View>
                    </View>
                    <View style={styles.exerciseMetaRow}>
                      <Text style={styles.exerciseMeta}>{rm.grupo_muscular || "Grupo general"}</Text>
                      <Text style={styles.exerciseMeta}> · {rm.equipamiento || "Equipo libre"}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.testBox}>
                  <Text style={styles.testTitle}>Prueba registrada</Text>
                  <Text style={styles.testText}>{formatNumber(rm.peso)} kg / {formatNumber(rm.peso_lb || Number(rm.peso) * 2.2046226218)} lb · {rm.repeticiones_usadas || rm.repeticiones || "-"} repeticiones · {String(rm.tipo_registro || "ESTIMADO").replaceAll("_", " ")}</Text>
                </View>
                <Text style={styles.percentTitle}>Cargas sugeridas según tu RM</Text>
                <View style={styles.percentGrid}>
                  {(rm.cargas_porcentaje || buildPercentages(rm.rm_estimado)).map((carga) => (
                    <View key={carga.porcentaje} style={styles.percentItem}>
                      <Text style={styles.percentValue}>{carga.porcentaje}%</Text>
                      <Text style={styles.percentLoad}>{formatNumber(carga.kg)} kg</Text>
                      <Text style={styles.percentLb}>{formatNumber(carga.lb)} lb</Text>
                    </View>
                  ))}
                </View>
                {rm.observaciones ? <Text style={styles.notes}>Observación: {rm.observaciones}</Text> : null}
              </AppCard>
            ))
          ) : (
            <EmptyState
              icon={searchQuery ? "database-search-outline" : "weight-lifter"}
              title={searchQuery ? "Sin coincidencias" : "Sin RMs registrados"}
              subtitle={searchQuery ? "No se encontraron ejercicios con ese nombre." : "Aun no tienes marcas de fuerza registradas."}
            />
          )}
        </View>
      </ScrollView>

    </View>
  );
}

function ExerciseVisual({ rm }) {
  const sourceUrl = getExerciseImageUrl(rm);

  return (
    <View style={styles.visualBox}>
      {sourceUrl ? (
        <Image source={{ uri: sourceUrl }} style={styles.visualImage} resizeMode="cover" />
      ) : (
        <View style={styles.visualFallback}>
          <MaterialCommunityIcons name={getExerciseIcon(rm?.ejercicio)} size={30} color={colors.primaryStrong} />
        </View>
      )}
    </View>
  );
}

function getExerciseImageUrl(rm) {
  const direct = normalizeAssetUrl(rm?.imagen_url || rm?.ejercicio_imagen_url || rm?.recurso_url);
  const youtube = getYoutubeThumbnail(rm?.recurso_url || rm?.url_recurso || rm?.video_url);
  return youtube || direct;
}

function getYoutubeThumbnail(value) {
  if (!value || typeof value !== "string") return null;
  const patterns = [/youtu\.be\/([^?&]+)/, /youtube\.com\/watch\?v=([^?&]+)/, /youtube\.com\/embed\/([^?&]+)/];
  const match = patterns.map((pattern) => value.match(pattern)).find(Boolean);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function getExerciseIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("sentadilla") || lower.includes("squat")) return "weight-lifter";
  if (lower.includes("press")) return "arm-flex-outline";
  if (lower.includes("peso muerto")) return "dumbbell";
  if (lower.includes("dominada")) return "human-handsup";
  return "dumbbell";
}

function formatNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : "-";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function buildPercentages(rm) {
  const value = Number(rm || 0);
  return [50, 60, 70, 75, 80, 85, 90, 95, 100].map((porcentaje) => ({ porcentaje, kg: value * porcentaje / 100, lb: value * porcentaje / 100 * 2.2046226218 }));
}

const styles = StyleSheet.create({
  summaryCard: { padding: 16, backgroundColor: colors.primaryPale },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  summaryValue: { fontSize: 30, fontWeight: "900", color: colors.primaryStrong },
  summaryLabel: { fontSize: 11, fontWeight: "800", color: colors.textSoft },
  summaryDivider: { width: 1, height: 48, backgroundColor: colors.border },
  summaryTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  summaryText: { marginTop: 3, fontSize: 11, lineHeight: 16, color: colors.textSoft },
  recordCard: {
    padding: 12,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  visualBox: {
    width: 86,
    height: 92,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center'
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  visualFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  recordInfo: {
    flex: 1,
    minHeight: 92,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  ejercicio: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 2
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dateMeta: {
    alignItems: "flex-end",
  },
  metaValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "900",
  },
  metaLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: "700",
  },
  rmValue: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.text
  },
  rmUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft
  },
  lbValue: { fontSize: 12, color: colors.primaryStrong, fontWeight: "800", marginTop: -3 },
  exerciseMetaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  exerciseMeta: { fontSize: 10, color: colors.textSoft, fontWeight: "700" },
  testBox: { marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  testTitle: { fontSize: 11, fontWeight: "900", color: colors.text },
  testText: { marginTop: 3, fontSize: 11, lineHeight: 16, color: colors.textSoft, fontWeight: "700" },
  percentTitle: { marginTop: 13, marginBottom: 8, fontSize: 12, fontWeight: "900", color: colors.text },
  percentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  percentItem: { width: "31.5%", paddingVertical: 7, paddingHorizontal: 5, borderRadius: 9, alignItems: "center", backgroundColor: colors.primaryPale },
  percentValue: { fontSize: 11, fontWeight: "900", color: colors.primaryStrong },
  percentLoad: { marginTop: 2, fontSize: 11, fontWeight: "900", color: colors.text },
  percentLb: { fontSize: 9, fontWeight: "700", color: colors.textSoft },
  notes: { marginTop: 10, fontSize: 11, lineHeight: 16, color: colors.textSoft, fontStyle: "italic" },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 999,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    marginBottom: 8,
  }
});
