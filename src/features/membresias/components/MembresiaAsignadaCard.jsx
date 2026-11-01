import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";

export const estadoMembresia = (m) => {
  const codigo = String(m?.estado || "").toUpperCase();
  if (codigo === "ACTIVA" || codigo === "ACTIVO") return { label: "Activa", tint: "#047857", bg: "#DFF7EC" };
  if (codigo === "PENDIENTE_PAGO") return { label: "Pendiente de pago", tint: "#92400E", bg: "#FFF3D6" };
  if (codigo === "VENCIDA") return { label: "Vencida", tint: "#B91C1C", bg: "#FEE2E2" };
  if (codigo === "CANCELADA") return { label: "Cancelada", tint: "#64748B", bg: "#F1F5F9" };
  return { label: m?.estado_nombre || codigo || "Sin estado", tint: "#475569", bg: "#F1F5F9" };
};
export const fechaCorta = (v) => v ? String(v).slice(0, 10) : "No registrada";
export const dinero = (v) => v == null ? "No disponible" : `$${Number(v).toFixed(2)}`;

export default function MembresiaAsignadaCard({ membresia, onDetail }) {
  const status = estadoMembresia(membresia);
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}><MaterialCommunityIcons name="card-account-details-star-outline" size={26} color={colors.white}/></View>
        <View style={styles.copy}>
          <Text style={styles.plan} numberOfLines={2}>{membresia.plan_nombre || "Membresía asignada"}</Text>
          <Text style={styles.code}>{membresia.codigo_contrato || "Contrato sin código"}</Text>
        </View>
      </View>
      <View style={[styles.status, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText,{color:status.tint}]}>{status.label}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>Modalidad: {membresia.modalidad_nombre || "No aplica"}</Text>
        <Text style={styles.detail}>Sede principal: {membresia.sede_nombre || "Sin especificar"}</Text>
        <Text style={styles.detail}>Vigencia: {fechaCorta(membresia.fecha_inicio)} — {fechaCorta(membresia.fecha_fin)}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.action} onPress={onDetail}>
        <Text style={styles.actionText}>Ver detalle de asignación</Text>
        <MaterialCommunityIcons name="arrow-right" color={colors.accentDark} size={21}/>
      </Pressable>
    </AppCard>
  );
}
const styles=StyleSheet.create({
  card:{padding:16,borderRadius:18,gap:12},
  header:{flexDirection:"row",alignItems:"center",gap:12},
  icon:{width:50,height:50,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:colors.accent},
  copy:{flex:1,minWidth:0},plan:{fontSize:17,fontWeight:"900",color:colors.text},code:{fontSize:12,color:colors.textSoft,marginTop:4},
  status:{alignSelf:"flex-start",paddingHorizontal:12,paddingVertical:7,borderRadius:18},
  statusText:{fontSize:11,fontWeight:"800"},
  details:{gap:5},detail:{fontSize:13,color:colors.textSoft},
  action:{borderTopWidth:1,borderTopColor:colors.border,paddingTop:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  actionText:{color:colors.accentDark,fontSize:13,fontWeight:"900"},
});