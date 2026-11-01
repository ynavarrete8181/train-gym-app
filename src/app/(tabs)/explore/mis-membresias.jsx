import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../../components/common/AppHeader";
import MembresiaAsignadaCard from "../../../features/membresias/components/MembresiaAsignadaCard";
import { obtenerMisMembresias } from "../../../features/membresias/services/misMembresiasService";
import { colors } from "../../../theme/colors";
import { getScreenBottomPadding } from "../../../theme/layout";

export default function MisMembresiasPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);setError("");
    try { setItems(await obtenerMisMembresias()); }
    catch (e) { setError("No se pudieron consultar tus membresías. Verifica la conexión e intenta nuevamente."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); },[load]);
  return <View style={styles.screen}>
    <AppHeader title="Mis membresías" subtitle="Consulta las asignaciones de tu cuenta" showBack/>
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>}
      contentContainerStyle={[styles.content,{paddingBottom:getScreenBottomPadding(insets.bottom,32)}]}>
      {loading && !items.length ? <ActivityIndicator color={colors.accent}/> : null}
      {error ? <View style={styles.empty}><Text style={styles.text}>{error}</Text><Pressable onPress={load}><Text style={styles.link}>Reintentar</Text></Pressable></View> : null}
      {!loading && !error && !items.length ? <View style={styles.empty}>
        <MaterialCommunityIcons name="card-account-details-outline" size={43} color={colors.accent}/>
        <Text style={styles.title}>Sin membresías asignadas</Text>
        <Text style={styles.text}>Aún no tienes contratos asociados a tu cuenta.</Text>
      </View> : null}
      {!error && items.map(item => <MembresiaAsignadaCard key={String(item.id)} membresia={item}
        onDetail={() => router.push({pathname:"/(tabs)/explore/membresia-detalle",params:{id:String(item.id)}})}/>)}
      <Pressable style={styles.explore} onPress={()=>router.push("/(tabs)/explore/planes")}>
        <Text style={styles.link}>Explorar planes disponibles</Text><MaterialCommunityIcons name="arrow-right" size={20} color={colors.accentDark}/>
      </Pressable>
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  content:{padding:20,gap:14},
  empty:{backgroundColor:colors.white,padding:24,borderRadius:18,alignItems:"center",gap:12},
  title:{fontSize:17,fontWeight:"900",color:colors.text},
  text:{fontSize:13,color:colors.textSoft,textAlign:"center"},
  explore:{padding:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  link:{color:colors.accentDark,fontWeight:"900",fontSize:13}
});