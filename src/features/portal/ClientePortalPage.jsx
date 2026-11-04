import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBadge from "../../components/common/AppBadge";
import AppCard from "../../components/common/AppCard";
import AppHeader from "../../components/common/AppHeader";
import EmptyState from "../../components/common/EmptyState";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding } from "../../theme/layout";
import { appStyles } from "../../theme/theme";
import { getPortal } from "./portalService";

const config = {
  asistencia: { icon: "calendar-check-outline", title: "Mi asistencia", subtitle: "Tus ingresos y constancia por sede." },
  resultados: { icon: "chart-box-outline", title: "Resumen de resultados", subtitle: "Tu evolución explicada de forma sencilla." },
  calendario: { icon: "calendar-month-outline", title: "Mi calendario", subtitle: "Entrenamientos y reservas programadas." },
  entrenador: { icon: "account-tie-outline", title: "Mi entrenador", subtitle: "Responsable de tu planificación y seguimiento." },
};

export default function ClientePortalPage({ modo }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); getPortal().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);
  useRefreshOnFocus(scrollRef, load);
  const head = config[modo];

  if (loading && !data) return <View style={[appStyles.screen, styles.center]}><ActivityIndicator color={colors.primary} /></View>;
  return <View style={appStyles.screen}>
    <AppHeader icon={head.icon} title={head.title} subtitle={head.subtitle} showBack showSettings />
    <ScrollView ref={scrollRef} contentContainerStyle={[appStyles.container, styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom) }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>
      {modo === "asistencia" ? <Asistencia data={data?.asistencia} /> : null}
      {modo === "resultados" ? <Resultados data={data?.resultados} /> : null}
      {modo === "calendario" ? <Calendario data={data?.calendario} /> : null}
      {modo === "entrenador" ? <Entrenador data={data?.entrenador} /> : null}
    </ScrollView>
  </View>;
}

function Asistencia({ data }) {
  const items = data?.registros || [];
  return <><View style={styles.metricRow}><Metric value={data?.mes || 0} label="Ingresos este mes" /><Metric value={data?.total || 0} label="Ingresos totales" /></View>{items.length ? items.map((x) => <AppCard key={x.id}><Row title={x.sede || "Revive"} value={dateTime(x.fecha_hora)} /><Row title="Ingreso" value={`${x.metodo || "REGISTRO"} · ${x.estado || "VALIDADO"}`} /></AppCard>) : <EmptyState icon="calendar-remove-outline" title="Sin ingresos registrados" subtitle="Tus asistencias aparecerán cuando ingreses a una sede." />}</>;
}

function Resultados({ data }) {
  const cambios = data?.cambios;
  return <><AppCard><Text style={styles.cardTitle}>Cumplimiento del entrenamiento</Text><Text style={styles.hero}>{data?.cumplimiento || 0}%</Text><Text style={styles.muted}>{data?.sesiones_completadas || 0} de {data?.sesiones_total || 0} sesiones completadas</Text></AppCard>{cambios ? <AppCard><Text style={styles.cardTitle}>Primer control vs. último</Text><View style={styles.grid}><Change label="Peso" value={cambios.peso_kg} unit="kg" /><Change label="Cintura" value={cambios.cintura_cm} unit="cm" /><Change label="Grasa" value={cambios.grasa_pct} unit="%" /><Change label="Masa magra" value={cambios.masa_magra_kg} unit="kg" /></View></AppCard> : null}<AppCard><Text style={styles.cardTitle}>Marcas actuales</Text>{(data?.rm || []).slice(0, 8).map((x) => <Row key={x.ejercicio} title={x.ejercicio} value={`${num(x.rm_estimado)} kg · ${num(Number(x.rm_estimado) * 2.20462)} lb`} />)}</AppCard></>;
}

function Calendario({ data = [] }) {
  return data.length ? data.map((x, i) => <AppCard key={`${x.tipo}-${x.id}-${i}`}><View style={styles.between}><Text style={styles.cardTitle}>{x.titulo || "Actividad"}</Text><AppBadge tone={x.tipo === "RESERVA" ? "primary" : "purple"}>{x.tipo}</AppBadge></View><Text style={styles.date}>{dateOnly(x.fecha)} {x.hora_inicio ? `· ${String(x.hora_inicio).slice(0, 5)}` : ""}</Text><Text style={styles.muted}>{x.sede || `Semana ${x.semana || "-"} · ${x.dia || ""}`} · {x.estado}</Text></AppCard>) : <EmptyState icon="calendar-blank-outline" title="Calendario vacío" subtitle="Aquí aparecerán tus reservas y entrenamientos." />;
}

function Entrenador({ data }) {
  if (!data) return <EmptyState icon="account-off-outline" title="Sin entrenador asignado" subtitle="Cuando se confirme tu asignación, aquí aparecerá su información." />;
  return <><AppCard><Text style={styles.heroName}>{data.name}</Text><Text style={styles.accent}>{data.especialidad || "Preparación física"}</Text><Row title="Tipo de seguimiento" value={data.tipo_asignacion || data.tipo} /><Row title="Sede" value={data.sede || "Por definir"} /><Row title="Desde" value={dateOnly(data.fecha_inicio)} />{data.observaciones ? <Text style={styles.notes}>{data.observaciones}</Text> : null}</AppCard><AppCard><Text style={styles.cardTitle}>Horario de atención</Text>{(data.horarios || []).length ? data.horarios.map((h, i) => <Row key={`${h.dia_semana}-${i}`} title={h.dia_semana} value={`${String(h.hora_inicio).slice(0, 5)} – ${String(h.hora_fin).slice(0, 5)}`} />) : <Text style={styles.muted}>El entrenador coordinará el horario contigo.</Text>}</AppCard></>;
}

function Metric({ value, label }) { return <AppCard style={styles.metric}><Text style={styles.hero}>{value}</Text><Text style={styles.muted}>{label}</Text></AppCard>; }
function Change({ label, value, unit }) { const positive = Number(value) > 0; return <View style={styles.change}><Text style={styles.muted}>{label}</Text><Text style={[styles.changeValue, { color: positive ? colors.warning : colors.success }]}>{positive ? "+" : ""}{num(value)} {unit}</Text></View>; }
function Row({ title, value }) { return <View style={styles.row}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowValue}>{value || "-"}</Text></View>; }
const num = (v) => Number(v || 0).toFixed(1);
const dateOnly = (v) => v ? String(v).slice(0, 10).split("-").reverse().join("/") : "-";
const dateTime = (v) => v ? new Date(v).toLocaleString() : "-";

const styles = StyleSheet.create({ center: { alignItems: "center", justifyContent: "center" }, content: { gap: 14, paddingTop: 18 }, metricRow: { flexDirection: "row", gap: 12 }, metric: { flex: 1 }, hero: { fontSize: 30, fontWeight: "900", color: colors.primaryStrong }, heroName: { fontSize: 23, fontWeight: "900", color: colors.text }, accent: { color: colors.primaryStrong, fontWeight: "900", marginTop: 4, marginBottom: 12 }, cardTitle: { fontSize: 16, fontWeight: "900", color: colors.text }, muted: { color: colors.textSoft, fontWeight: "700", marginTop: 4 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 9 }, rowTitle: { flex: 1, color: colors.textSoft, fontWeight: "800" }, rowValue: { flex: 1, color: colors.text, fontWeight: "900", textAlign: "right" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, change: { width: "48%", padding: 10, borderRadius: 10, backgroundColor: colors.surfaceSoft }, changeValue: { fontSize: 16, fontWeight: "900", marginTop: 3 }, between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }, date: { marginTop: 8, color: colors.primaryStrong, fontWeight: "900" }, notes: { marginTop: 12, color: colors.textSoft, lineHeight: 19 } });
