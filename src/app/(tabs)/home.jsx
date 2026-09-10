import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBadge from "../../components/common/AppBadge";
import AppCard from "../../components/common/AppCard";
import AppModal from "../../components/common/AppModal";
import OutlineButton from "../../components/common/OutlineButton";
import SmartVideoPlayer from "../../components/routine/SmartVideoPlayer";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../features/dashboard/useDashboard";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { typography } from "../../theme/typography";
import { shadows } from "../../theme/shadows";
import { getScreenBottomPadding, getScreenTopPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import AppWatermarkBackground from "../../components/common/AppWatermarkBackground";

const { width: windowWidth } = Dimensions.get("window");

const HELP_VIDEO_URL = process.env.EXPO_PUBLIC_HELP_VIDEO_URL;
const HELP_VIDEO_SOURCE = HELP_VIDEO_URL || require("../../../assets/videos/revive-app-demo.mp4");

const PROMO_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop", // Supplements/Gym
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop", // Weights
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop", // Workout
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { data, loading, reload, productos } = useDashboard();
  const { plan, membresia, deuda, usuario, proxima_reserva, factura } = data || {};
  const displayName = getShortName(usuario || user?.name);
  const [helpVisible, setHelpVisible] = useState(false);
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  const quickActions = useMemo(() => {
    return [
      { title: "Rutina", icon: "dumbbell", iconColor: colors.purple, onPress: () => router.push("/(tabs)/routine") },
      { title: "Reservas", icon: "calendar-check-outline", iconColor: colors.success, onPress: () => router.push("/(tabs)/explore/reservas") },
      { title: "Ficha", icon: "account-outline", iconColor: colors.accentDark, onPress: () => router.push("/(tabs)/explore/ficha") },
      { title: "Evaluación", icon: "clipboard-check-outline", iconColor: colors.blue, onPress: () => router.push("/(tabs)/explore/evaluaciones") },
      { title: "Acceso", icon: "qrcode-scan", iconColor: colors.secondary, onPress: () => router.push("/(tabs)/explore/acceso") },
      { title: "Factura", icon: "receipt-outline", iconColor: colors.blue, onPress: () => router.push("/(tabs)/explore/facturas") },
    ];
  }, [router]);

  useRefreshOnFocus(scrollRef, reload, { skipInitial: true });

  const onScrollPromo = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (!slideSize) return;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActivePromoIndex(Math.max(0, Math.round(index) || 0));
  };

  // Validar productos reales para mostrar en el carrusel
  const promoSlides = useMemo(() => {
    const valid = Array.isArray(productos) ? productos.filter(p => p.imagen_url) : [];
    if (valid.length > 0) {
      return valid.map(p => ({ url: p.imagen_url, title: p.nombre, subtitle: `$${Number(p.precio_venta || 0).toFixed(2)}` }));
    }
    return PROMO_IMAGES.map(url => ({ url, title: "REVIVE SPORTS", subtitle: "Lleva tu cuerpo al límite" }));
  }, [productos]);

  if (loading && !data) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando tu resumen...</Text>
      </View>
    );
  }

  return (
    <AppWatermarkBackground style={appStyles.screen}>
      {/* ───── Cabecera (Oscura) ───── */}
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

      {/* ───── Membresía (Flotante) ───── */}
      <View style={styles.floatingCardContainer}>
        <AppCard style={styles.membershipCard}>
          <View style={styles.membershipTop}>
            <View style={styles.membershipIcon}>
              <MaterialCommunityIcons name="card-account-details-star-outline" size={28} color={colors.surface} />
            </View>

            <View style={styles.membershipCopy}>
              <View style={styles.membershipTitleRow}>
                <Text style={styles.membershipTitle}>{membresia?.nombre || "Sin membresía"}</Text>
                <AppBadge tone={membresia ? "success" : "warning"}>
                  {membresia ? "ACTIVO" : "PENDIENTE"}
                </AppBadge>
              </View>
              <Text style={styles.membershipDate}>
                Vence el: <Text style={styles.successText}>{membresia?.fecha_fin ? new Date(membresia.fecha_fin).toLocaleDateString() : "-"}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.membershipBottom}>
            <View>
              <Text style={styles.smallLabel}>{deuda?.tiene_deuda ? "Saldo pendiente" : "Último pago"}</Text>
              <Text style={[styles.lastPayment, deuda?.tiene_deuda && { color: colors.danger }]}>
                {deuda?.tiene_deuda ? `$${Number(deuda.saldo_total || 0).toFixed(2)}` : factura ? `$${Number(factura.total || 0).toFixed(2)}` : "Sin pagos"}
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
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroller}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom, 40) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.accent} />}
      >
        {/* ───── Carrusel de Promociones ───── */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollPromo}
            scrollEventThrottle={16}
          >
            {promoSlides.map((slide, idx) => (
              <View key={idx} style={styles.promoSlide}>
                <Image source={{ uri: slide.url }} style={styles.promoImage} />
                <View style={styles.promoOverlay}>
                  <Text style={styles.promoOverlayTitle}>{slide.title}</Text>
                  <Text style={styles.promoOverlaySub}>{slide.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          {/* Pagination */}
          <View style={styles.paginationRow}>
            {promoSlides.map((_, idx) => (
              <View key={idx} style={[styles.dot, activePromoIndex === idx && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ───── Accesos Rápidos Circulares ───── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.actionsScrollContent}
          style={styles.actionsScrollView}
        >
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.circularAction} onPress={action.onPress}>
              <View style={styles.circularIconWrap}>
                <MaterialCommunityIcons name={action.icon} size={28} color={colors.navy} />
              </View>
              <Text style={styles.circularActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ───── Tu Próxima Reserva ───── */}
        {!!proxima_reserva && (
          <AppCard style={styles.planCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>Tu próxima clase</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/explore/reservas")}>
                <Text style={styles.linkText}>Mis reservas</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.planInner, { backgroundColor: "rgba(16, 185, 129, 0.08)" }]}>
              <View style={[styles.planIcon, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <MaterialCommunityIcons name="calendar-clock-outline" size={25} color={colors.success} />
              </View>
              <View style={styles.planCopy}>
                <Text style={styles.planMeta}>
                  {proxima_reserva?.fecha || "-"} · {proxima_reserva?.hora_inicio?.substring(0, 5) || "-"}
                </Text>
                <Text style={styles.planTitle} numberOfLines={1}>
                  {proxima_reserva?.servicio_nombre || "Entrenamiento General"}
                </Text>
                <Text style={styles.planMeta} numberOfLines={1}>
                  {proxima_reserva?.sede_nombre || ""}
                </Text>
              </View>
              <AppBadge tone="success">Confirmada</AppBadge>
            </View>
          </AppCard>
        )}

        {/* ───── Tu plan de hoy ───── */}
        {!!plan && (
          <AppCard style={styles.planCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>Tu plan de hoy</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/routine")}>
                <Text style={styles.linkText}>Ver rutina</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.planInner}>
              <View style={styles.planIcon}>
                <MaterialCommunityIcons name="calendar-month-outline" size={25} color="#6D4AFF" />
              </View>

              <View style={styles.planCopy}>
                <Text style={styles.planMeta}>
                  {plan.diaActualLabel || getTodayLabel()} · Semana {plan.semanaActual || 1}
                </Text>
                <Text style={styles.planTitle} numberOfLines={1}>
                  {plan.nombre || "Plan actual"}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(Number(plan.porcentaje || 0), 100)}%` }]} />
                </View>
                <Text style={styles.planMeta}>
                  {Number(plan.ejerciciosCompletados || 0)} / {Number(plan.ejerciciosTotal || 0)} ejercicios completados
                </Text>
              </View>

              <Text style={styles.percent}>{Number(plan.porcentaje || 0)}%</Text>
            </View>
          </AppCard>
        )}

      </ScrollView>

      <AppModal
        visible={helpVisible}
        title="Como usar la app"
        subtitle="Guia rapida para moverte por Revive Sports."
        icon="play-circle-outline"
        onClose={() => setHelpVisible(false)}
      >
        <View style={styles.helpVideoFrame}>
          <SmartVideoPlayer url={HELP_VIDEO_SOURCE} />
        </View>
        <Text style={styles.helpText}>Mira el resumen rapido y luego entra a tu rutina, progreso, ficha o facturas desde los accesos.</Text>
      </AppModal>
    </AppWatermarkBackground>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getShortName(fullName) {
  if (!fullName) return "Usuario";
  if (typeof fullName !== "string") {
    if (fullName.nombres) return `${fullName.nombres} ${fullName.apellidos || ''}`.trim();
    return "Usuario";
  }
  const parts = fullName.trim().split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[1]}` : fullName;
}

function getTodayLabel() {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[new Date().getDay()];
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const HEADER_HEIGHT = 160;

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
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    justifyContent: 'center',
  },
  headerContent: {
    paddingBottom: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoR: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
    fontStyle: "italic",
    marginLeft: -2,
  },
  logoDot: {
    position: "absolute",
    bottom: 6,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  logoTextWhite: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 1,
  },
  logoTextYellow: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  helpButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  settingsButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.surface,
  },
  floatingCardContainer: {
    position: "absolute",
    top: HEADER_HEIGHT - 60,
    left: 20,
    right: 20,
    zIndex: 100,
    ...shadows.floating,
  },
  membershipCard: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
  },
  membershipTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  membershipIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  membershipCopy: {
    flex: 1,
  },
  membershipTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  membershipDate: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: "600",
  },
  successText: {
    color: colors.success,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  membershipBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallLabel: {
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: "700",
  },
  lastPayment: {
    marginTop: 2,
  },
  scroller: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingTop: 80, // Space for floating card
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  carouselContainer: {
    height: 180,
    borderRadius: radius.xl,
    overflow: "hidden",
    position: "relative",
  },
  promoSlide: {
    width: windowWidth - 40,
    height: 180,
    position: "relative",
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: radius.xl,
  },
  promoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32, // For gradient feeling
    backgroundColor: "rgba(0,0,0,0.3)", // In a real app we'd use LinearGradient
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  promoOverlayTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: "900",
  },
  promoOverlaySub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  paginationRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.surface,
    width: 12,
  },
  actionsScrollView: {
    marginHorizontal: -20, // Let it bleed to edges
  },
  actionsScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    alignItems: "center",
  },
  circularAction: {
    alignItems: "center",
    gap: 8,
    width: 72,
  },
  circularIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  circularActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  planCard: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSectionTitle: {
    ...typography.sectionTitle,
    fontSize: 16,
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  planInner: {
    minHeight: 100,
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
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  planTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  percent: {
    alignSelf: "flex-end",
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  helpVideoFrame: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.text,
  },
  helpText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10,
  },
});
