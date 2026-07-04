import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getEvaluaciones } from "../../../features/explore/exploreService";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import AppCard from "../../../components/common/AppCard";
import WebSemanticButton from "../../../components/common/WebSemanticButton";
import AppHeader from "../../../components/common/AppHeader";
import AppBadge from "../../../components/common/AppBadge";
import AppModal from "../../../components/common/AppModal";
import EmptyState from "../../../components/common/EmptyState";

export default function EvaluacionesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState(null);

  useEffect(() => {
    getEvaluaciones()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  const evaluaciones = data || [];

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="clipboard-pulse-outline"
        title="Evaluaciones Fisicas"
        subtitle="Control de rendimiento y valoraciones de estado."
        showBack
        showSettings
      />

      <ScrollView contentContainerStyle={[appStyles.container, { gap: 20, paddingTop: 0, paddingBottom: 112 }]} style={styles.scrollArea}>
        {evaluaciones && evaluaciones.length > 0 ? (
          <>
            {/* Tarjeta principal superpuesta */}
            <AppCard style={styles.featuredCard}>
              <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.primary} />
                  <Text style={styles.date}>{new Date(evaluaciones[0].fecha_evaluacion).toLocaleDateString()}</Text>
                </View>
                <AppBadge tone="primary">{evaluaciones[0].tipo_evaluacion}</AppBadge>
              </View>
              
              <View style={styles.featuredContent}>
                <Text style={styles.label}>NIVEL / ESTADO</Text>
                <Text style={styles.featuredValue}>{evaluaciones[0].nivel_resultado || '-'}</Text>
              </View>

              <View style={{ marginTop: 8 }}>
                <WebSemanticButton
                  label="VER DETALLE"
                  icon="file-document-outline"
                  tone="primary"
                  onPress={() => setSelectedEval(evaluaciones[0])}
                  borderWidth={1}
                />
              </View>
            </AppCard>

            {/* Historial */}
            {evaluaciones.length > 1 && (
              <View style={styles.historySection}>
                <Text style={appStyles.sectionTitle}>Historial</Text>
                <View style={styles.historyList}>
                  {evaluaciones.slice(1).map((ev, index) => (
                    <View key={index} style={styles.historyRow}>
                      <Text style={styles.historyDate}>{new Date(ev.fecha_evaluacion).toLocaleDateString()}</Text>
                      <AppBadge tone="primary" style={styles.historyBadge}>{ev.tipo_evaluacion}</AppBadge>
                      <Text style={[styles.historyStatus, { color: ev.nivel_resultado?.toLowerCase() === 'excelente' ? colors.success : ev.nivel_resultado?.toLowerCase() === 'bueno' ? colors.text : colors.warning }]}>
                        {ev.nivel_resultado || '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={{ marginTop: 40 }}>
            <EmptyState title="Sin evaluaciones" subtitle="No tienes evaluaciones fisicas registradas todavia." />
          </View>
        )}
      </ScrollView>

      <AppModal
        visible={!!selectedEval}
        title="Detalle de evaluacion"
        subtitle={selectedEval ? new Date(selectedEval.fecha_evaluacion).toLocaleDateString() : ""}
        icon="clipboard-pulse-outline"
        onClose={() => setSelectedEval(null)}
        footer={
          <WebSemanticButton
            label="CERRAR"
            icon="close"
            tone="danger"
            onPress={() => setSelectedEval(null)}
            borderWidth={1.5}
          />
        }
      >
        {selectedEval && (
          <View style={{ gap: 18 }}>
            <View>
              <Text style={styles.label}>Nivel / Estado</Text>
              <Text style={styles.value}>{selectedEval.nivel_resultado || '-'}</Text>
            </View>

            <View>
              <Text style={styles.label}>Resumen</Text>
              <Text style={styles.textValue}>{selectedEval.resultado_resumen || 'Sin resumen'}</Text>
            </View>

            {selectedEval.observaciones ? (
              <View>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={[styles.textValue, { color: colors.textSoft }]}>{selectedEval.observaciones}</Text>
              </View>
            ) : null}

            {selectedEval.fecha_proxima_evaluacion ? (
              <View>
                <Text style={styles.label}>Proxima evaluacion</Text>
                <Text style={[styles.value, { color: colors.accent }]}>
                  {new Date(selectedEval.fecha_proxima_evaluacion).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    marginTop: -20,
    zIndex: 10,
  },
  featuredCard: {
    padding: 20,
    gap: 16,
    ...appStyles.premiumCard,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text
  },
  featuredContent: {
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSoft,
    textTransform: 'uppercase'
  },
  featuredValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    textTransform: 'uppercase'
  },
  historySection: {
    marginTop: 12,
    gap: 16,
  },
  historyList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    width: 80,
  },
  historyBadge: {
    backgroundColor: colors.primarySoft,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'right',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  textValue: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text
  },
});
