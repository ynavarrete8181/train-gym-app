import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";

const metric = (value, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export default function RoutineExerciseCard({ ejercicio, index, planId, week, day }) {
  const router = useRouter();
  const objetivo = ejercicio.carga_objetivo == null ? "Sin carga indicada" : `${ejercicio.carga_objetivo} · ${ejercicio.tipo_carga || "carga"}`;
  const plannedSeries = Array.isArray(ejercicio.series_planificadas) && ejercicio.series_planificadas.length
    ? ejercicio.series_planificadas
    : Array.from({ length: Number(ejercicio.series || 0) }, (_, i) => ({
    numero_serie: i + 1,
    reps: ejercicio.repeticiones,
    target_load: ejercicio.peso_sugerido ?? ejercicio.carga_objetivo,
    prescripcion_carga: {
      tipo: ejercicio.tipo_carga,
      carga_redondeada: ejercicio.peso_sugerido,
      porcentaje_rm: ejercicio.tipo_carga === "PORCENTAJE_RM" ? Number(ejercicio.carga_objetivo) : null,
      rm_origen: ejercicio.rm_estimado ? "registro_rm" : null,
    },
    }));
  const openDetail = () => router.push({ pathname: `/exercise/${ejercicio.ejercicio_id}`, params: {
    plan_id: planId, plan_ejercicio_id: ejercicio.id, week, day,
    series: ejercicio.series, reps: ejercicio.repeticiones,
    load: ejercicio.peso_sugerido ?? ejercicio.carga_objetivo,
    planned_series: JSON.stringify(plannedSeries),
    transferencias: JSON.stringify(ejercicio.transferencias || []),
  }});
  return <AppCard style={styles.card}>
    <View style={styles.heading}>
      <View style={styles.ordinal}><Text style={styles.ordinalText}>{index + 1}</Text></View>
      <View style={styles.titleWrap}>
        <Text style={styles.name}>{ejercicio.nombre}</Text>
        <Text style={styles.group}>{[ejercicio.grupo_muscular, ejercicio.equipamiento].filter(Boolean).join(" · ")}</Text>
      </View>
    </View>
    {ejercicio.bloque ? <Text style={styles.block}>{ejercicio.bloque}</Text> : null}
    <View style={styles.metrics}>
      <View style={styles.metric}><Text style={styles.caption}>Series</Text><Text style={styles.value}>{metric(ejercicio.series)}</Text></View>
      <View style={styles.metric}><Text style={styles.caption}>Repeticiones</Text><Text style={styles.value}>{metric(ejercicio.repeticiones)}</Text></View>
      <View style={styles.metric}><Text style={styles.caption}>Descanso</Text><Text style={styles.value}>{ejercicio.descanso_segundos != null ? `${ejercicio.descanso_segundos}s` : "—"}</Text></View>
    </View>
    <View style={styles.detailRow}><MaterialCommunityIcons name="weight-lifter" size={17} color={colors.accentDark}/><Text style={styles.detail}>{ejercicio.peso_sugerido != null ? `${ejercicio.peso_sugerido} kg · ${ejercicio.peso_sugerido_lb} lb · ${objetivo}` : objetivo}</Text></View>
    {ejercicio.transferencias?.length ? <View style={styles.detailRow}><MaterialCommunityIcons name="transfer-right" size={17} color={colors.accentDark}/><Text style={styles.detail}>{ejercicio.transferencias.length} transferencia(s) asociada(s)</Text></View> : null}
    <Pressable onPress={openDetail} style={styles.detailButton}>
      <MaterialCommunityIcons name="eye-outline" size={18} color={colors.white}/>
      <Text style={styles.detailButtonText}>Ver detalle y registrar</Text>
    </Pressable>
  </AppCard>;
}
const styles=StyleSheet.create({
  card:{padding:15,borderRadius:16,gap:12},
  heading:{flexDirection:"row",alignItems:"center",gap:12},
  ordinal:{height:42,width:42,borderRadius:13,backgroundColor:colors.primaryPale,justifyContent:"center",alignItems:"center"},
  ordinalText:{fontSize:19,fontWeight:"900",color:colors.primaryStrong},
  titleWrap:{flex:1,minWidth:0},
  name:{fontSize:16,fontWeight:"900",color:colors.text},
  group:{fontSize:12,color:colors.textSoft,marginTop:4},
  block:{fontSize:12,fontWeight:"800",color:colors.accentDark},
  metrics:{flexDirection:"row",gap:8},
  metric:{flex:1,backgroundColor:colors.surfaceAlt,borderRadius:10,padding:9},
  caption:{fontSize:10,color:colors.textSoft,fontWeight:"700"},
  value:{fontSize:14,fontWeight:"900",color:colors.text,marginTop:5},
  detailRow:{flexDirection:"row",alignItems:"center",gap:6},
  detail:{color:colors.textSoft,fontSize:12},
  detailButton:{backgroundColor:colors.primaryDark,borderRadius:12,paddingVertical:12,paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},
  detailButtonText:{color:colors.white,fontSize:13,fontWeight:"900"},
});
