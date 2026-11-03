import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";

export default function MembershipSummary({ membership, onPress }) {
  const status = String(membership?.estado_consulta || membership?.estado || "").toUpperCase();
  const active = Boolean(membership) && (!status || status === "ACTIVA" || status === "ACTIVO" || status === "VIGENTE");
  const displayStatus = !membership ? "SIN MEMBRESÍA"
    : active ? "ACTIVA" : status === "CONGELADA" ? "CONGELADA"
      : status === "PENDIENTE_PAGO" ? "PENDIENTE DE PAGO"
        : status === "VENCIDA" ? "VENCIDA"
          : status === "CANCELADA" ? "CANCELADA" : status || "PENDIENTE";
  const endDate = membership?.fecha_fin_vigente || membership?.fecha_fin;
  const date = endDate ? String(endDate).substring(0, 10) : null;
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}><MaterialCommunityIcons name="card-account-details-star-outline" size={28} color={colors.white} /></View>
        <View style={styles.copy}>
          <Text style={styles.overline}>MI MEMBRESÍA</Text>
          <Text style={styles.title} numberOfLines={2}>{membership?.nombre || "Sin membresía"}</Text>
          <Text style={styles.detail}>{date ? `Vence: ${date}` : "Consulta tus planes disponibles"}</Text>
        </View>
        <View style={[styles.pill, active ? styles.pillActive : styles.pillPending]}>
          <Text style={[styles.pillText, { color: active ? "#047857" : "#92400E" }]}>{displayStatus}</Text>
        </View>
      </View>
      <View style={styles.rule} />
      <Pressable onPress={onPress} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Ver mi asignación</Text>
        <MaterialCommunityIcons name="arrow-right" size={19} color={colors.accentDark} />
      </Pressable>
    </AppCard>
  );
}
const styles = StyleSheet.create({
  card: { padding: 17, borderRadius: 19, borderColor: "rgba(15,23,42,0.08)", elevation: 5 },
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  icon: { width: 53, height: 53, backgroundColor: colors.accent, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0 },
  overline: { fontSize: 10, color: colors.muted, fontWeight: "800" },
  title: { fontSize: 17, fontWeight: "900", color: colors.text, marginTop: 3 },
  detail: { color: colors.textSoft, fontSize: 12, marginTop: 4 },
  pill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 18, alignSelf: "flex-start" },
  pillActive: { backgroundColor: "#DFF7EC" },
  pillPending: { backgroundColor: "#FFF3D6" },
  pillText: { fontSize: 9, fontWeight: "900" },
  rule: { backgroundColor: colors.border, height: 1, marginTop: 14 },
  link: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12 },
  linkText: { color: colors.accentDark, fontSize: 13, fontWeight: "800" },
});