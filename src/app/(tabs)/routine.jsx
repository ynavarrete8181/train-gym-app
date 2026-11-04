import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../components/common/AppHeader";
import AppCard from "../../components/common/AppCard";
import RoutineExerciseCard from "../../features/routine/components/RoutineExerciseCard";
import { consultarMiRutina } from "../../features/routine/services/memberRoutineService";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding } from "../../theme/layout";

const DIAS = [
  ["LUNES", "Lun"], ["MARTES", "Mar"], ["MIERCOLES", "Mié"],
  ["JUEVES", "Jue"], ["VIERNES", "Vie"], ["SABADO", "Sáb"], ["DOMINGO", "Dom"],
];
const currentDay = () => DIAS[(new Date().getDay() + 6) % 7][0];

export default function RoutinePage() {
  const insets = useSafeAreaInsets();
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(currentDay);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await consultarMiRutina(week, day));
    } catch (_err) {
      setData(null);
      setError("No se pudo consultar tu rutina. Verifica la conexión e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [week, day]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const estado = data?.estado;
  const maxWeeks = Math.max(1, Math.min(52, Number(data?.total_semanas || 1)));
  const exercises = Array.isArray(data?.ejercicios) ? data.ejercicios : [];

  return <View style={styles.root}>
    <AppHeader title="Mi rutina" subtitle="Entrenamiento según tu membresía" icon="dumbbell" rounded />
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent}/>}
      contentContainerStyle={[styles.content, {paddingBottom:getScreenBottomPadding(insets.bottom,30)}]}>
      {loading && !data ? <ActivityIndicator size="large" color={colors.accent}/> : null}
      {error ? <AppCard style={styles.notice}>
        <MaterialCommunityIcons name="alert-circle-outline" size={28} color={colors.warning}/>
        <Text style={styles.noticeText}>{error}</Text>
        <Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable>
      </AppCard> : null}
      {!error && data && estado !== "DISPONIBLE" ? <AppCard style={styles.notice}>
        <MaterialCommunityIcons name="clipboard-text-off-outline" size={39} color={colors.accentDark}/>
        <Text style={styles.title}>{estado === "SIN_MEMBRESIA_VIGENTE" ? "Sin membresía vigente" : estado === "SIN_PLAN_ENTRENAMIENTO" ? "Sin rutina asignada" : "Rutina no disponible"}</Text>
        <Text style={styles.noticeText}>{data.mensaje || "Consulta con el gimnasio para configurar tu entrenamiento."}</Text>
      </AppCard> : null}
      {!error && estado === "DISPONIBLE" ? <>
        <AppCard style={styles.summary}>
          <Text style={styles.eyebrow}>MI MEMBRESÍA</Text>
          <Text style={styles.memberTitle}>{data.membresia?.nombre}</Text>
          <View style={styles.divider}/>
          <Text style={styles.eyebrow}>PLAN DE ENTRENAMIENTO</Text>
          <Text style={styles.planTitle}>{data.plan?.nombre}</Text>
          {data.plan?.objetivo ? <Text style={styles.objective}>{data.plan.objetivo}</Text> : null}
        </AppCard>
        <Text style={styles.sectionTitle}>Selecciona tu semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
          {Array.from({length:maxWeeks}, (_,i)=>i+1).map(n=><Pressable key={n} onPress={()=>setWeek(n)} style={[styles.chip,week===n&&styles.chipActive]}>
            <Text style={[styles.chipText,week===n&&styles.chipTextActive]}>Semana {n}</Text>
          </Pressable>)}
        </ScrollView>
        <Text style={styles.sectionTitle}>Día de entrenamiento</Text>
        <View style={styles.days}>
          {DIAS.map(([key,label])=><Pressable key={key} onPress={()=>setDay(key)} style={[styles.day,day===key&&styles.chipActive]}>
            <Text style={[styles.chipText,day===key&&styles.chipTextActive]}>{label}</Text>
          </Pressable>)}
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ejercicios</Text>
          <Text style={styles.count}>{exercises.length} asignados</Text>
        </View>
        {loading ? <ActivityIndicator color={colors.accent}/> : exercises.length ?
          exercises.map((e,i)=><RoutineExerciseCard key={String(e.id)} ejercicio={e} index={i} planId={data.plan?.id} week={week} day={day}/>) :
          <AppCard style={styles.notice}><MaterialCommunityIcons name="weather-night" color={colors.accentDark} size={36}/>
            <Text style={styles.title}>Sin ejercicios para este día</Text>
            <Text style={styles.noticeText}>Tu entrenador no ha programado ejercicios para esta combinación de semana y día.</Text>
          </AppCard>}
      </> : null}
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.background},
  content:{paddingHorizontal:20,paddingTop:20,gap:15},
  notice:{padding:25,borderRadius:18,alignItems:"center",gap:12},
  noticeText:{color:colors.textSoft,textAlign:"center",fontSize:13,lineHeight:19},
  title:{fontSize:18,fontWeight:"900",color:colors.text,textAlign:"center"},
  retry:{paddingVertical:10,paddingHorizontal:18,backgroundColor:colors.primary,borderRadius:12},
  retryText:{fontSize:13,fontWeight:"900",color:colors.white},
  summary:{padding:18,borderRadius:18,gap:6},
  eyebrow:{fontSize:11,fontWeight:"900",color:colors.muted},
  memberTitle:{fontSize:19,fontWeight:"900",color:colors.text},
  divider:{height:1,backgroundColor:colors.border,marginVertical:9},
  planTitle:{fontSize:16,fontWeight:"900",color:colors.text},
  objective:{fontSize:12,color:colors.textSoft,marginTop:4},
  sectionTitle:{fontSize:17,fontWeight:"900",color:colors.text},
  choices:{gap:9,paddingVertical:2},
  chip:{borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,paddingHorizontal:15,paddingVertical:10},
  chipActive:{backgroundColor:colors.primaryDark,borderColor:colors.primaryDark},
  chipText:{fontSize:12,fontWeight:"800",color:colors.text},
  chipTextActive:{color:colors.white},
  days:{flexDirection:"row",gap:4,justifyContent:"space-between"},
  day:{flex:1,alignItems:"center",paddingVertical:11,borderRadius:11,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border},
  sectionHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  count:{fontSize:12,color:colors.textSoft,fontWeight:"700"},
});
