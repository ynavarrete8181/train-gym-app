import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Searchbar, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPlanes } from "../../../features/explore/exploreService";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { getScreenBottomPadding } from "../../../theme/layout";
import AppBadge from "../../../components/common/AppBadge";
import AppCard from "../../../components/common/AppCard";
import AppHeader from "../../../components/common/AppHeader";
import EmptyState from "../../../components/common/EmptyState";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";

export default function PlanesPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [planes, setPlanes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPlanes = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    getPlanes()
      .then(setPlanes)
      .catch((error) => {
        setLoadError(error?.message || "No se pudieron consultar los planes.");
        setPlanes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useRefreshOnFocus(scrollRef, loadPlanes);

  const filteredPlanes = useMemo(() => {
    const list = Array.isArray(planes) ? planes : [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((plan) => {
      return [plan.nombre, plan.descripcion, String(plan.duracion_dias || "")]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [planes, searchQuery]);

  if (loading && !planes) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="card-account-details-star-outline"
        title="Planes"
        subtitle="Membresias disponibles para entrenar en Revive."
        showBack
        showSettings
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlanes} tintColor={colors.primary} />}
      >
        <Searchbar
          placeholder="Buscar plan..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
          inputStyle={styles.searchInput}
        />

        {loadError ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={28} color={colors.warning} />
            <Text style={styles.errorTitle}>No se pudieron cargar los planes</Text>
            <Text style={styles.errorBody}>{loadError}</Text>
            <Pressable onPress={loadPlanes} style={styles.retryButton} accessibilityRole="button"><Text style={styles.retryText}>Reintentar</Text></Pressable>
          </View>
        ) : filteredPlanes.length > 0 ? (
          <View style={styles.list}>
            {filteredPlanes.map((plan, index) => (
              <PlanCard key={plan.id || `${plan.nombre}-${index}`} plan={plan} featured={index === 0 && !searchQuery} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="card-account-details-star-outline"
            title={searchQuery ? "Sin resultados" : "Sin planes disponibles"}
            subtitle={searchQuery ? "No encontramos un plan con ese criterio." : "Aun no hay membresias activas para mostrar."}
          />
        )}
      </ScrollView>
    </View>
  );
}

function PlanCard({ plan, featured }) {
  const durationText = formatDuration(plan.tipo_duracion, plan.duracion);
  const price = plan.precio == null ? null : Number(plan.precio);

  return (
    <AppCard style={[styles.planCard, featured && styles.planCardFeatured]}>
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={26} color={colors.surface} />
        </View>
        <View style={styles.planTitleBlock}>
          <Text style={styles.planTitle}>{plan.nombre || "Plan Revive"}</Text>
          <Text style={styles.planSubtitle}>{durationText}</Text>
        </View>
        {featured ? <AppBadge tone="warning">Popular</AppBadge> : null}
      </View>

      <Text style={styles.planDescription}>
        {plan.descripcion || "Acceso al gimnasio y beneficios disponibles segun tu membresia."}
      </Text>

      <View style={styles.planFooter}>
        <View>
          <Text style={styles.priceLabel}>Desde</Text>
          <Text style={styles.priceValue}>{price == null ? "Consultar" : `${price.toFixed(2)}`}</Text>
        </View>
        <View style={styles.billingPill}>
          <MaterialCommunityIcons name="calendar-sync-outline" size={16} color={colors.primaryStrong} />
          <Text style={styles.billingText}>
            {plan.renovable ? "Renovable" : "Pago único"}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

function formatDuration(type, duration) {
  const value = Number(duration || 0);
  if (!value) return "Duración según modalidad";
  const unit = { DIAS: ["día", "días"], SEMANAS: ["semana", "semanas"], MESES: ["mes", "meses"], ANIOS: ["año", "años"] }[String(type || "").toUpperCase()] || ["período", "períodos"];
  return `${value} ${value === 1 ? unit[0] : unit[1]}`;
}

const styles = StyleSheet.create({
  errorCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 22, alignItems: "center", gap: 12 },
  errorTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "center" },
  errorBody: { color: colors.textSoft, fontSize: 13, textAlign: "center" },
  retryButton: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: colors.text, fontWeight: "900" },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    color: colors.text,
  },
  list: {
    gap: 14,
  },
  planCard: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  planCardFeatured: {
    borderColor: "rgba(242, 177, 0, 0.5)",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  planTitle: {
    ...typography.itemTitle,
    fontSize: 17,
  },
  planSubtitle: {
    ...typography.itemSubtitle,
    marginTop: 2,
  },
  planDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    fontWeight: "700",
  },
  planFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.08)",
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "900",
    marginTop: 1,
  },
  billingPill: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryPale,
  },
  billingText: {
    fontSize: 12,
    color: colors.primaryStrong,
    fontWeight: "900",
  },
});
