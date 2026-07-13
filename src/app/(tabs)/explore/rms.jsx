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
                  </View>
                </View>
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

      {/* Botón flotante para agregar RM */}
      <View style={[styles.fabContainer, { bottom: getScreenBottomPadding(insets.bottom, 8) }]}>
        <View style={styles.fab}>
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
        </View>
      </View>
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

const styles = StyleSheet.create({
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
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 999,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    marginBottom: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  }
});
