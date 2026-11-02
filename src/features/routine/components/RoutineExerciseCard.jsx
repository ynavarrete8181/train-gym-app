import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppCard from "../../../components/common/AppCard";
import SmartVideoPlayer from "../../../components/routine/SmartVideoPlayer";
import { colors } from "../../../theme/colors";
import { normalizeAssetUrl } from "../../../api/apiClient";

const metric = (value, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export default function RoutineExerciseCard({ ejercicio, index }) {
  const video = ejercicio.video_url ? normalizeAssetUrl(ejercicio.video_url) : null;
  const objetivo = ejercicio.carga_objetivo == null ? "Sin carga indicada" : `${ejercicio.carga_objetivo} · ${ejercicio.tipo_carga || "carga"}`;
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
    <View style={styles.detailRow}><MaterialCommunityIcons name="weight-lifter" size={17} color={colors.accentDark}/><Text style={styles.detail}>{objetivo}</Text></View>
    {ejercicio.notas ? <Text style={styles.notes}>Indicaciones del entrenador: {ejercicio.notas}</Text> : null}
    {ejercicio.instrucciones ? <Text style={styles.notes}>{ejercicio.instrucciones}</Text> : null}
    {video ? <View style={styles.video}><SmartVideoPlayer url={video}/></View> : null}
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
  notes:{color:colors.textSoft,fontSize:12,lineHeight:19},
  video:{borderRadius:12,overflow:"hidden"},
});