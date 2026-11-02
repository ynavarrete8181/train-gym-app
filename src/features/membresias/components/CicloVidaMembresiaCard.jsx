import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";
import { fechaCorta } from "./MembresiaAsignadaCard";

/**
 * Política C — Fase 1. Pantalla de consulta, no habilita acciones de negocio.
 * El servidor decide las fechas efectivas y la emisión de ventas/cuotas.
 */
export default function CicloVidaMembresiaCard({ membresia }) {
  if (!membresia?.id) return null;

  const estado = String(membresia.estado || "").toUpperCase();
  const cuotas = Array.isArray(membresia.cuotas) ? membresia.cuotas : [];
  const cantidadPeriodos = membresia.cantidad_periodos_contratados;
  const contratoConCuotas = cantidadPeriodos !== null && cantidadPeriodos !== undefined;
  const programadas = cuotas.filter(c => String(c.estado || "").toUpperCase() === "PROGRAMADA").length;

  const descripcion = ["VENCIDA", "CANCELADA"].includes(estado)
    ? "Este contrato finalizó. Un nuevo ingreso corresponde a otra contratación; la reapertura del contrato es excepcional."
    : estado === "CONGELADA"
      ? "La membresía figura como congelada. Las fechas y los cobros deben confirmarse mediante el historial administrativo."
      : "Las congelaciones y reactivaciones se gestionarán por el club según el contrato y sus obligaciones pendientes.";

  return (
    <AppCard style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={22} color={colors.accentDark}/>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Estado y vigencia del contrato</Text>
          <Text style={styles.subtitle}>Política de congelación según el tipo de contrato</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.label}>Vigencia registrada</Text>
          <Text style={styles.value}>{fechaCorta(membresia.fecha_inicio)} – {fechaCorta(membresia.fecha_fin)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Tipo de contrato</Text>
          <Text style={styles.value}>{contratoConCuotas ? `${cantidadPeriodos} período(s) contratados` : "Sin calendario fijo de cuotas"}</Text>
        </View>
        {contratoConCuotas ? <View style={styles.metric}>
          <Text style={styles.label}>Cuotas por emitir</Text>
          <Text style={styles.value}>{programadas}</Text>
        </View> : null}
      </View>
      <View style={styles.note}>
        <MaterialCommunityIcons name="information-outline" size={19} color={colors.textSoft}/>
        <Text style={styles.noteText}>{descripcion}</Text>
      </View>
      <Text style={styles.disclaimer}>
        Este resumen es informativo. Los pagos confirmados y saldos se administran en Ventas y Cartera; el estado de la membresía no cancela automáticamente una deuda.
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 17, borderRadius: 17, gap: 14 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 40, height: 40, backgroundColor: colors.primaryPale, borderRadius: 12,
    alignItems: "center", justifyContent: "center" },
  titleGroup: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900" },
  subtitle: { color: colors.textSoft, fontSize: 11, marginTop: 2 },
  metrics: { gap: 11 },
  metric: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 9 },
  label: { fontSize: 11, color: colors.textSoft },
  value: { fontSize: 13, fontWeight: "800", color: colors.text, marginTop: 3 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: colors.surfaceSoft,
    padding: 11, borderRadius: 11 },
  noteText: { fontSize: 12, color: colors.text, flex: 1, lineHeight: 18 },
  disclaimer: { color: colors.textSoft, fontSize: 11, lineHeight: 17 },
});
