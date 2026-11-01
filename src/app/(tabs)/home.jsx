import { useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppModal from "../../components/common/AppModal";
import SmartVideoPlayer from "../../components/routine/SmartVideoPlayer";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../features/dashboard/useDashboard";
import HomeHero from "../../features/dashboard/components/HomeHero";
import MembershipSummary from "../../features/dashboard/components/MembershipSummary";
import ProductsShowcase from "../../features/dashboard/components/ProductsShowcase";
import HomeShortcuts from "../../features/dashboard/components/HomeShortcuts";
import NextWorkoutCard from "../../features/dashboard/components/NextWorkoutCard";
import AppWatermarkBackground from "../../components/common/AppWatermarkBackground";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

const HELP_VIDEO_SOURCE = process.env.EXPO_PUBLIC_HELP_VIDEO_URL || require("../../../assets/videos/revive-app-demo.mp4");

export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const { data, loading, reload, productos } = useDashboard();
  const [helpVisible, setHelpVisible] = useState(false);
  const { membresia, plan, usuario, proxima_reserva } = data || {};

  useRefreshOnFocus(scrollRef, reload, { skipInitial: true });

  if (loading && !data) return <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.accent} />
    <Text style={styles.loadingText}>Preparando tu experiencia REVIVE...</Text>
  </View>;

  return (
    <AppWatermarkBackground imageOpacity={0.18} style={styles.root}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.accent} />}
        contentContainerStyle={{ paddingBottom: getScreenBottomPadding(insets.bottom, 35) }}>
        <HomeHero
          name={usuario || user?.name}
          plan={plan}
          topInset={insets.top}
          onHelp={() => setHelpVisible(true)}
          onNotifications={() => router.push("/(tabs)/explore/notificaciones")}
        />
        <View style={styles.membershipWrap}>
          <MembershipSummary membership={membresia} onPress={() => router.push("/(tabs)/explore/planes")} />
        </View>
        <View style={styles.sections}>
          <ProductsShowcase products={productos} />
          <HomeShortcuts onNavigate={(path) => router.push(path)} />
          <NextWorkoutCard booking={proxima_reserva} plan={plan}
            onBooking={() => router.push("/(tabs)/explore/reservas")}
            onRoutine={() => router.push("/(tabs)/routine")} />
        </View>
      </ScrollView>
      <AppModal visible={helpVisible} title="Cómo usar la app"
        subtitle="Descubre las funciones de REVIVE SPORTS"
        icon="play-circle-outline" onClose={() => setHelpVisible(false)}>
        <View style={styles.video}><SmartVideoPlayer url={HELP_VIDEO_SOURCE} /></View>
        <Text style={styles.help}>Consulta tus entrenamientos, reservas, membresías y servicios desde los accesos rápidos.</Text>
      </AppModal>
    </AppWatermarkBackground>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: colors.textSoft, fontWeight: "700" },
  membershipWrap: { marginTop: 16, marginHorizontal: 20 },
  sections: { paddingHorizontal: 20, gap: 25, paddingTop: 24 },
  video: { height: 220, borderRadius: 14, overflow: "hidden" },
  help: { marginTop: 12, color: colors.textSoft, fontSize: 13, lineHeight: 20 },
});