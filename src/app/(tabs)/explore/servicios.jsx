import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppHeader from "../../../components/common/AppHeader";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getScreenBottomPadding } from "../../../theme/layout";

export default function ServiciosPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const options = [
    { title: "Explorar planes", detail: "Consulta las membresías disponibles.", icon: "card-account-details-star-outline", route: "/(tabs)/explore/planes" },
    { title: "Mis reservas", detail: "Consulta o gestiona tus sesiones.", icon: "calendar-check-outline", route: "/(tabs)/explore/reservas" },
  ];
  return <View style={styles.screen}>
    <AppHeader showBack title="Servicios" subtitle="Experiencias deportivas de REVIVE SPORTS" />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom, 32) }]}>
      <AppCard style={styles.notice}>
        <MaterialCommunityIcons name="information-outline" size={25} color={colors.accentDark} />
        <View style={{ flex: 1 }}><Text style={styles.noticeTitle}>Catálogo de servicios</Text><Text style={styles.noticeText}>Estamos preparando la consulta de servicios por sede, entrenador y horario. Mientras tanto, puedes explorar planes y consultar tus reservas.</Text></View>
      </AppCard>
      {options.map(option => <Pressable key={option.title} onPress={() => router.push(option.route)}>
        <AppCard style={styles.option}>
          <MaterialCommunityIcons name={option.icon} size={27} color={colors.secondary} />
          <View style={{ flex: 1 }}><Text style={styles.title}>{option.title}</Text><Text style={styles.detail}>{option.detail}</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted} />
        </AppCard>
      </Pressable>)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 14 },
  notice: { flexDirection: "row", gap: 12, backgroundColor: colors.primaryPale, padding: 16 },
  noticeTitle: { fontSize: 15, color: colors.text, fontWeight: "900" },
  noticeText: { color: colors.textSoft, fontSize: 13, lineHeight: 19, marginTop: 5 },
  option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  title: { color: colors.text, fontWeight: "900", fontSize: 15 },
  detail: { color: colors.textSoft, fontSize: 12, marginTop: 4 },
});