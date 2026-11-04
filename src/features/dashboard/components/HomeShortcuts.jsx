import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../../theme/colors";

const shortcuts = [
  { title: "Rutina", icon: "dumbbell", route: "/(tabs)/routine" },
  { title: "Reservas", icon: "calendar-check-outline", route: "/(tabs)/explore/reservas" },
  { title: "Facturas", icon: "receipt-text-outline", route: "/(tabs)/explore/facturas" },
  { title: "Mis RM", icon: "weight-lifter", route: "/(tabs)/explore/rms" },
  { title: "Resultados", icon: "chart-line-variant", route: "/(tabs)/explore/resultados" },
  { title: "Progreso físico", icon: "clipboard-pulse-outline", route: "/(tabs)/explore/evaluaciones" },
  { title: "Asistencia", icon: "calendar-check-outline", route: "/(tabs)/explore/asistencia" },
  { title: "Calendario", icon: "calendar-month-outline", route: "/(tabs)/explore/calendario" },
  { title: "Mi entrenador", icon: "account-tie-outline", route: "/(tabs)/explore/entrenador" },
  { title: "Servicios", icon: "view-grid-outline", route: "/(tabs)/explore/servicios" },
  { title: "Mi QR", icon: "qrcode-scan", route: "/(tabs)/explore/acceso" },
];

export default function HomeShortcuts({ onNavigate }) {
  return <View style={styles.section}>
    <Text style={styles.title}>Accesos rápidos</Text>
    <View style={styles.grid}>
      {shortcuts.map(item => <Pressable key={item.title} onPress={() => onNavigate(item.route)} style={styles.item} accessibilityRole="button">
        <View style={styles.circle}><MaterialCommunityIcons name={item.icon} size={27} color={colors.secondary} /></View>
        <Text style={styles.label}>{item.title}</Text>
      </Pressable>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: 14 },
  title: { fontSize: 19, fontWeight: "900", color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 16 },
  item: { width: "33.333%", alignItems: "center", gap: 8 },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "800", color: colors.text, fontSize: 11, textAlign: "center" },
});
