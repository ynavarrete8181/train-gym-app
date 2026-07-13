import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBadge from "../../components/common/AppBadge";
import AppCard from "../../components/common/AppCard";
import OutlineButton from "../../components/common/OutlineButton";
import QuickActionCard from "../../components/common/QuickActionCard";
import AppModal from "../../components/common/AppModal";
import SmartVideoPlayer from "../../components/routine/SmartVideoPlayer";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../features/dashboard/useDashboard";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { typography } from "../../theme/typography";
import { getScreenBottomPadding, getScreenTopPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

const HELP_VIDEO_URL = process.env.EXPO_PUBLIC_HELP_VIDEO_URL;

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { data, loading, reload } = useDashboard();
  const { plan, membresia, factura, deuda, usuario } = data || {};
  const displayName = getShortName(usuario || user?.name);
  const [helpVisible, setHelpVisible] = useState(false);

  const quickActions = useMemo(() => {
    return [
      { title: "Rutina", icon: "dumbbell", iconColor: colors.purple, bgColor: colors.surface, onPress: () => router.push("/(tabs)/routine") },
      { title: "Ficha", icon: "account-outline", iconColor: colors.accentDark, bgColor: colors.surface, onPress: () => router.push("/(tabs)/explore/ficha") },
      { title: "Evaluación", icon: "clipboard-check-outline", iconColor: colors.blue, bgColor: colors.surface, onPress: () => router.push("/(tabs)/explore/evaluaciones") },
      { title: "RM", icon: "trophy-outline", iconColor: colors.danger, bgColor: colors.surface, onPress: () => router.push("/(tabs)/explore/rms") },
      { title: "Evolución", icon: "chart-line-variant", iconColor: colors.success, bgColor: colors.surface, onPress: () => router.push("/(tabs)/progress") },
      { title: "Factura", icon: "receipt-outline", iconColor: colors.blue, bgColor: colors.surface, onPress: () => router.push("/(tabs)/explore/facturas") },
    ];
  }, [router]);

  useRefreshOnFocus(scrollRef, reload, { skipInitial: true });

  if (loading && !data) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando tu resumen...</Text>
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top, 10) }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.logoRow}>
                <View style={styles.logoIconPlaceholder}>
                  <Text style={styles.logoR}>R</Text>
                  <View style={styles.logoDot} />
                </View>
                <Text style={styles.logoTextWhite}>EVIVE</Text>
                <Text style={styles.logoTextYellow}>SPORTS</Text>
              </View>

              <View style={styles.headerActions}>
                <OutlineButton
                  label="Ayuda"
                  icon="play-circle-outline"
                  onPress={() => setHelpVisible(true)}
                  style={styles.helpButton}
                />
                <TouchableOpacity activeOpacity={0.85} style={styles.settingsButtonWrapper}>
                  <MaterialCommunityIcons name="cog" size={24} color={colors.surface} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerTextBlock}>
              <Text style={styles.title}>
                Hola, {displayName} 👋
              </Text>
            </View>
          </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroller}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom, 72) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.accent} />}
      >
        {/* ───── Membresía (arriba según mockup) ───── */}
        <AppCard style={styles.membershipCard}>
          <View style={styles.membershipTop}>
            <View style={styles.membershipIcon}>
              <MaterialCommunityIcons name="card-account-details-star-outline" size={28} color={colors.surface} />
            </View>

            <View style={styles.membershipCopy}>
              <View style={styles.membershipTitleRow}>
                <Text style={styles.membershipTitle}>{membresia?.nombre || "Sin membresía"}</Text>
                <AppBadge tone={membresia ? "success" : "warning"}>
                  {membresia ? "Activo" : "Pendiente"}
                </AppBadge>
              </View>
              <Text style={styles.membershipDate}>
                Vence el: <Text style={styles.successText}>{membresia?.fecha_fin ? formatDate(membresia.fecha_fin) : "-"}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.membershipBottom}>
            <View>
              <Text style={styles.smallLabel}>{deuda?.tiene_deuda ? "Saldo pendiente" : "Último pago"}</Text>
              <Text style={[styles.lastPayment, deuda?.tiene_deuda && { color: colors.danger }]}>
                {deuda?.tiene_deuda ? `$${formatMoney(deuda.saldo_total)}` : factura ? `$${formatMoney(factura.total)}` : "Sin pagos"}
              </Text>
            </View>

            <OutlineButton
              label="Ver mis facturas"
              icon="file-document-outline"
              onPress={() => router.push(factura?.id ? { pathname: "/(tabs)/explore/facturas", params: { openId: factura.id } } : "/(tabs)/explore/facturas")}
              style={styles.invoiceButton}
            />
          </View>
        </AppCard>

        {/* ───── Tu plan de hoy ───── */}
        {plan && (
          <AppCard style={styles.planCard}>
            <SectionHeader title="Tu plan de hoy" action="Ver rutina" onPress={() => router.push("/(tabs)/routine")} />
            <View style={styles.planInner}>
              <View style={styles.planIcon}>
                <MaterialCommunityIcons name="calendar-month-outline" size={25} color="#6D4AFF" />
              </View>

              <View style={styles.planCopy}>
                <Text style={styles.planMeta}>{getTodayLabel()} · Semana 1</Text>
                <Text style={styles.planTitle} numberOfLines={1}>
                  {plan.nombre || "Plan actual"}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: plan.porcentaje ? `${plan.porcentaje}%` : "0%" }]} />
                </View>
                <Text style={styles.planMeta}>0 / {plan.diasConfigurados || 4} ejercicios completados</Text>
              </View>

              <Text style={styles.percent}>{plan.porcentaje || 0}%</Text>
            </View>
          </AppCard>
        )}

        {/* ───── Accesos rápidos ───── */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} style={styles.quickAction} />
          ))}
        </View>

        {/* ───── Banner Promocional ───── */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>Lleva tu entrenamiento{"\n"}al siguiente nivel</Text>
          <Text style={styles.promoSubtitle}>Descubre nuevos planes y{"\n"}alcanza tus metas.</Text>
          <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
            <Text style={styles.promoButtonText}>Explorar planes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppModal
        visible={helpVisible}
        title="Como usar la app"
        subtitle="Guia rapida para moverte por Revive Sports."
        icon="play-circle-outline"
        onClose={() => setHelpVisible(false)}
      >
        {HELP_VIDEO_URL ? (
          <View style={styles.helpVideoFrame}>
            <SmartVideoPlayer url={HELP_VIDEO_URL} />
          </View>
        ) : (
          <View style={styles.helpVideoPlaceholder}>
            <MaterialCommunityIcons name="play-circle-outline" size={46} color={colors.accentDark} />
            <Text style={styles.helpVideoPlaceholderText}>Video de ayuda pendiente</Text>
          </View>
        )}
        <Text style={styles.helpText}>Mira el resumen rapido y luego entra a tu rutina, progreso, ficha o facturas desde los accesos.</Text>
      </AppModal>
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function SectionHeader({ title, action, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <OutlineButton
        label={action}
        onPress={onPress}
        style={styles.sectionActionBtn}
      />
    </View>
  );
}

function getShortName(fullName) {
  if (!fullName) return "Usuario";
  const parts = fullName.trim().split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[1]}` : fullName;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function formatMoney(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}

function getTodayLabel() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[new Date().getDay()];
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSoft,
    fontWeight: "700",
  },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 24,
    paddingBottom: 80,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  helpButton: {
    height: 36,
    minWidth: 108,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  scroller: {
    position: "relative",
    zIndex: 10,
    elevation: 10,
    marginTop: -46,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconPlaceholder: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 4,
  },
  logoR: {
    color: colors.surface,
    fontWeight: "900",
    fontSize: 24,
    fontStyle: "italic",
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginLeft: 2,
  },
  logoTextWhite: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 2,
  },
  logoTextYellow: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 10,
    position: "absolute",
    bottom: -10,
    right: 0,
    letterSpacing: 1,
  },
  settingsButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    minHeight: 90,
    paddingTop: 10,
  },
  headerTextBlock: {
    gap: 6,
  },
  welcome: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    ...typography.screenSubtitle,
    fontSize: 15,
    opacity: 0.8,
  },
  settingsButton: {
    width: 58,
    height: 58,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 18,
    gap: 22,
  },
  helpVideoFrame: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.text,
  },
  helpVideoPlaceholder: {
    minHeight: 180,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  helpVideoPlaceholderText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  helpText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  membershipCard: {
    gap: 18,
  },
  membershipTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  membershipIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  membershipCopy: {
    flex: 1,
    gap: 5,
  },
  membershipTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  membershipTitle: {
    ...typography.cardTitle,
  },
  membershipDate: {
    fontSize: 15,
    color: colors.textSoft,
    fontWeight: "700",
  },
  successText: {
    color: colors.success,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  membershipBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  smallLabel: {
    fontSize: 15,
    color: colors.textSoft,
    fontWeight: "700",
  },
  lastPayment: {
    marginTop: 4,
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
  },
  invoiceButton: {
    minWidth: 142,
    height: 46,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontSize: 15,
  },
  sectionActionBtn: {
    height: 32,
    minWidth: 100,
    paddingHorizontal: 12,
  },
  planCard: {
    gap: 16,
  },
  planInner: {
    minHeight: 122,
    borderRadius: radius.lg,
    backgroundColor: "#F5F1FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  planIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: "rgba(109, 74, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  planCopy: {
    flex: 1,
  },
  planMeta: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  planTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  percent: {
    alignSelf: "flex-end",
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "900",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  quickAction: {
    width: "31.5%", // 3 columns
  },
  promoBanner: {
    marginTop: 10,
    backgroundColor: "#0F172A", // Dark navy background
    borderRadius: radius.xl,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  promoTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },
  promoSubtitle: {
    color: colors.textSoft,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  promoButton: {
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  promoButtonText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 15,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
  },
});
