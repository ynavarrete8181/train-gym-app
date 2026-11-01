import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";

export default function NextWorkoutCard({ booking, plan, onBooking, onRoutine }) {
  if (!booking && !plan) return null;
  const title = booking ? "Tu próxima sesión" : "Tu entrenamiento";
  const name = booking?.servicio_nombre || plan?.nombre || "Mi rutina";
  const detail = booking
    ? [booking.fecha, booking.hora_inicio?.substring(0, 5), booking.sede_nombre].filter(Boolean).join(" · ")
    : [plan?.diaActualLabel, plan?.semanaActual ? `Semana ${plan.semanaActual}` : null].filter(Boolean).join(" · ");
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}><MaterialCommunityIcons name={booking ? "calendar-clock-outline" : "dumbbell"} size={26} color={colors.accentDark} /></View>
        <View style={styles.copy}>
          <Text style={styles.label}>{title}</Text>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.details} numberOfLines={2}>{detail || "Consulta tus actividades"}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={booking ? onBooking : onRoutine} style={styles.arrow}>
          <MaterialCommunityIcons name="arrow-right" size={21} color={colors.secondary} />
        </Pressable>
      </View>
    </AppCard>
  );
}
const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  icon: { width: 50, height: 50, borderRadius: 15, backgroundColor: colors.primaryPale, justifyContent: "center", alignItems: "center" },
  copy: { flex: 1, minWidth: 0 },
  label: { fontSize: 11, color: colors.textSoft, fontWeight: "700" },
  name: { fontSize: 15, fontWeight: "900", color: colors.text, marginTop: 2 },
  details: { color: colors.textSoft, fontSize: 11, marginTop: 4 },
  arrow: { padding: 6 },
});