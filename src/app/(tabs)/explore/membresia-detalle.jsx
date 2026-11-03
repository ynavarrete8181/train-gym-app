import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../../components/common/AppHeader";
import AppCard from "../../../components/common/AppCard";
import { colors } from "../../../theme/colors";
import { getScreenBottomPadding } from "../../../theme/layout";
import { obtenerMisMembresias } from "../../../features/membresias/services/misMembresiasService";
import { dinero, estadoMembresia, fechaCorta } from "../../../features/membresias/components/MembresiaAsignadaCard";
import CicloVidaMembresiaCard from "../../../features/membresias/components/CicloVidaMembresiaCard";

function Row({label,value}) {
  if(value===null||value===undefined||value==="") return null;
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{String(value)}</Text></View>;
}
function Section({title,children}) {
  return <AppCard style={styles.section}><Text style={styles.heading}>{title}</Text>{children}</AppCard>;
}
function boolText(value){return value==null?"No especificado":value?"Sí":"No";}
export default function DetalleMembresiaPage() {
  const {id} = useLocalSearchParams();
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const [items,setItems]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{setItems(await obtenerMisMembresias());}
    catch(e){setError("No se pudo consultar el detalle de la membresía.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load()},[load]);
  const m=useMemo(()=>items?.find(x=>String(x.id)===String(id)),[items,id]);
  const status=estadoMembresia(m);
  return <View style={styles.screen}>
    <AppHeader title="Detalle de membresía" subtitle="Condiciones de tu asignación" showBack/>
    <ScrollView contentContainerStyle={[styles.content,{paddingBottom:getScreenBottomPadding(insets.bottom,32)}]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>}>
      {loading&&!items ? <ActivityIndicator color={colors.accent}/> : null}
      {error ? <Section title="No disponible"><Text style={styles.secondary}>{error}</Text><Pressable onPress={load}><Text style={styles.action}>Reintentar</Text></Pressable></Section>:null}
      {!loading&&!error&&!m ? <Section title="Membresía no encontrada"><Text style={styles.secondary}>No existe una asignación de tu cuenta con este identificador.</Text></Section>:null}
      {m ? <>
        <Section title={m.plan_nombre || "Membresía"}>
          <Text style={[styles.status,{color:status.tint}]}>{status.label}</Text>
          <Row label="Contrato" value={m.codigo_contrato}/>
          <Row label="Tipo" value={m.tipo_producto}/>
          <Row label="Modalidad" value={m.modalidad_nombre || "No aplica"}/>
          <Row label="Fecha de inicio" value={fechaCorta(m.fecha_inicio)}/>
          <Row label="Vigencia actual hasta" value={fechaCorta(m.fecha_fin_vigente || m.fecha_fin)}/>
          {m.fecha_fin_original && String(m.fecha_fin_original).slice(0,10)
            !== String(m.fecha_fin).slice(0,10)
            ? <Row label="Vencimiento originalmente pactado" value={fechaCorta(m.fecha_fin_original)}/> : null}
          <Row label="Precio contratado" value={dinero(m.precio_aplicado)}/>
          <Row label="Renovable" value={boolText(m.renovable)}/>
          <Row label="Renovación automática" value={boolText(m.renovacion_automatica)}/>
          <Row label="Próximo cobro programado" value={m.proxima_fecha_cobro && fechaCorta(m.proxima_fecha_cobro)}/>
        </Section>
        <CicloVidaMembresiaCard membresia={m} />
        <Section title="Modalidad y condiciones">
          <Row label="Duración" value={m.modalidad_duracion && `${m.modalidad_duracion} ${m.modalidad_tipo_duracion||"períodos"}`}/>
          <Row label="Días por semana" value={m.modalidad_dias_por_semana}/>
          <Row label="Usos por semana" value={m.modalidad_usos_por_semana}/>
          <Row label="Uso ilimitado" value={boolText(m.modalidad_uso_ilimitado)}/>
          <Row label="Requiere entrenador" value={boolText(m.requiere_entrenador)}/>
        </Section>
        <Section title="Sedes habilitadas">
          {(m.sedes_habilitadas||[]).length ? m.sedes_habilitadas.map((s,i)=>
            <Row key={i} label={s.es_principal?"Sede principal":"Sede habilitada"} value={s.sede_nombre}/>)
            : <Row label="Sede principal" value={m.sede_nombre||"No especificada"}/>}
        </Section>
        <Section title="Entrenadores y horarios asignados">
          {(m.asignaciones_entrenador||[]).length ? m.asignaciones_entrenador.map((a,i)=>
            <View key={a.id||i} style={styles.group}>
              <Row label="Entrenador" value={a.entrenador_nombre}/>
              <Row label="Sede" value={a.sede_nombre}/>
              <Row label="Horario" value={a.horario_nombre||"Sin descripción"}/>
              <Row label="Estado" value={a.estado}/>
              <Row label="Inicio" value={fechaCorta(a.fecha_inicio)}/>
            </View>) : <Text style={styles.secondary}>No se registran asignaciones activas de entrenador.</Text>}
        </Section>
        <Section title="Venta asociada y pagos">
          <Row label="Comprobante / venta" value={m.venta_numero||"Sin venta vinculada"}/>
          <Row label="Estado de venta" value={m.venta_estado}/>
          <Row label="Total de venta" value={dinero(m.venta_total)}/>
          <Row label="Pagos confirmados" value={dinero(m.total_pagado_confirmado)}/>
          <Row label="Saldo emitido pendiente" value={dinero(m.saldo_ventas_emitidas)}/>
          <Text style={styles.secondary}>Las cuotas muestran únicamente pagos confirmados.
            Una cuota futura sin emitir no constituye todavía una venta ni deuda emitida.</Text>
        </Section>
        {(m.periodos||[]).length ? <Section title="Períodos del contrato">
          {m.periodos.map((p,i)=><View key={p.id||i} style={styles.group}>
            <Row label="Período" value={p.numero_periodo}/>
            {p.renovacion_manual ? <Row label="Origen" value="Renovación manual del mismo contrato"/> : null}
            <Row label="Desde" value={fechaCorta(p.fecha_inicio)}/>
            <Row label="Hasta" value={fechaCorta(p.fecha_fin)}/>
            <Row label="Estado" value={p.estado}/>
            <Row label="Precio" value={dinero(p.precio)}/>
          </View>)}
        </Section>:null}
        {(m.cuotas||[]).length ? <Section title="Cuotas programadas">
          {m.cuotas.map((c,i)=><View key={c.id||i} style={styles.group}>
            <Row label="Cuota" value={c.numero_cuota}/>
            <Row label="Estado" value={c.estado}/>
            <Row label="Venta" value={c.venta_numero || "Aún no emitida"}/>
            <Row label="Estado de venta" value={c.venta_estado || "Sin emisión"}/>
            <Row label="Vencimiento" value={fechaCorta(c.fecha_vencimiento)}/>
            <Row label="Monto" value={dinero(c.monto)}/>
            <Row label="Pagado confirmado" value={dinero(c.monto_pagado)}/>
          </View>)}
        </Section>:null}
        <Pressable style={styles.back} onPress={()=>router.back()}><Text style={styles.action}>Volver a mis membresías</Text></Pressable>
      </>:null}
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  content:{padding:20,gap:14},
  section:{padding:17,borderRadius:17,gap:9},
  heading:{fontSize:17,fontWeight:"900",color:colors.text,marginBottom:5},
  status:{fontSize:13,fontWeight:"900",marginBottom:7},
  row:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",gap:12},
  label:{fontSize:12,color:colors.textSoft,flex:1},
  value:{fontSize:12,fontWeight:"700",color:colors.text,flex:1,textAlign:"right"},
  secondary:{fontSize:12,color:colors.textSoft,lineHeight:18},
  group:{borderTopWidth:1,borderTopColor:colors.border,paddingTop:11,marginTop:8,gap:8},
  action:{fontSize:13,fontWeight:"900",color:colors.accentDark},
  back:{alignItems:"center",padding:18}
});
