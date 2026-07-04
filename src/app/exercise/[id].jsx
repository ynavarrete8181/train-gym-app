import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Modal as RNModal, TouchableOpacity } from "react-native";
import { Text, Chip, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCard from "../../components/common/AppCard";
import WebSemanticButton from "../../components/common/WebSemanticButton";
import AppHeader from "../../components/common/AppHeader";
import LoadingView from "../../components/common/LoadingView";
import SeriesRow from "../../components/routine/SeriesRow";
import SmartVideoPlayer from "../../components/routine/SmartVideoPlayer";
import SecuenciaEjecucionModal from "../../components/routine/SecuenciaEjecucionModal";
import AppBadge from "../../components/common/AppBadge";
import CustomAlert from "../../components/common/CustomAlert";
import apiClient from "../../api/apiClient";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { modalStyles } from "../../theme/modalStyles";

export default function ExerciseDetailPage() {
  const params = useLocalSearchParams();
  const { id } = params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('carga');
  const [showChartModal, setShowChartModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await apiClient.get(`/app/ejercicios/${id}`);
        setDetail(data.data);
      } catch (error) {
        console.error("Error obteniendo el detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSaveSequence = async (payload) => {
    try {
      payload.plan_ejercicio_id = id;
      if (detail?.plan_id) payload.plan_id = detail.plan_id;
      else if (params.plan_id) payload.plan_id = params.plan_id;
      
      payload.fecha_ejecucion = new Date().toISOString().split('T')[0];

      await apiClient.post('/app/rutinas/ejecutar', payload);
      setShowSequenceModal(false);
      
      setTimeout(() => {
        setAlertConfig({ visible: true, title: "¡Excelente!", message: "Tu ejecución ha sido registrada.", type: "success" });
      }, 500);
      
      // Reload data to reflect new execution
      const { data } = await apiClient.get(`/app/ejercicios/${id}`);
      setDetail(data.data);
    } catch (error) {
      setShowSequenceModal(false);

      let errorMessage = "No se pudo registrar la ejecución. Intenta de nuevo.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Si hay errores de validación específicos (Laravel), tomar el primero
        if (error.response?.data?.errors) {
          const firstErrorKey = Object.keys(error.response.data.errors)[0];
          if (firstErrorKey) {
             errorMessage = error.response.data.errors[firstErrorKey][0];
          }
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setTimeout(() => {
        setAlertConfig({ 
          visible: true, 
          title: "Atención", 
          message: errorMessage, 
          type: "error" 
        });
      }, 500);
    }
  };

  if (loading || !detail) {
    return (
      <SafeAreaView style={appStyles.screen}>
        <LoadingView message="Cargando detalles del ejercicio..." />
      </SafeAreaView>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        title="Detalle de Ejercicio"
        showBack
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 20 }}>
          {/* Header del Ejercicio */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>
              {detail.name}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {detail.tags?.map(tag => (
                <AppBadge key={tag} tone="primary">{tag}</AppBadge>
              ))}
            </View>
          </View>

          {/* Video Player */}
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            {detail.videoUrl ? <SmartVideoPlayer url={detail.videoUrl} /> : (
              <View style={{ height: 200, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
                <MaterialCommunityIcons name="play-circle-outline" size={48} color={colors.primary} />
              </View>
            )}
          </View>

            {detail.historial && detail.historial.length > 0 && (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, backgroundColor: '#fff' }}
                onPress={() => setShowChartModal(true)}
              >
                <MaterialCommunityIcons name="chart-line" size={20} color={colors.primary} />
                <Text style={{ marginLeft: 6, fontSize: 13, color: '#111827', fontWeight: '700' }}>Evolución</Text>
              </TouchableOpacity>
            )}
          {/* Historial Reciente */}
          {detail.historial && detail.historial.length > 0 && (
            <AppCard>
              <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 }}>
                Últimas Ejecuciones
              </Text>
              <View style={{ gap: 12 }}>
                {detail.historial.map((h, index) => (
                  <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: index < detail.historial.length - 1 ? 1 : 0, borderBottomColor: "rgba(0,0,0,0.05)", paddingBottom: index < detail.historial.length - 1 ? 12 : 0 }}>
                    <View style={{ gap: 4 }}>
                      <Text style={{ fontWeight: "800", color: colors.text }}>
                        {new Date(h.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </Text>
                      {h.rpe ? (
                        <Text style={{ fontSize: 12, color: colors.textSoft }}>RPE: {h.rpe}</Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontWeight: "900", fontSize: 16, color: colors.primary }}>
                        {h.carga ? `${parseFloat(h.carga)} kg` : 'Libre'}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSoft }}>
                        {h.series} series
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </AppCard>
          )}

          {/* Cómo se hace */}
          <AppCard>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 }}>
              ¿Cómo se hace?
            </Text>
            <View style={{ gap: 8 }}>
              {detail.instructions?.map((step, index) => (
                <View key={index} style={{ flexDirection: "row", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.primary }}>{index + 1}.</Text>
                  <Text style={{ flex: 1, color: colors.textSoft, lineHeight: 20 }}>{step}</Text>
                </View>
              ))}
            </View>
            {detail.tips && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: "#FFF4E5", borderRadius: 12 }}>
                <Text style={{ color: "#E69900", fontWeight: "600", fontSize: 13 }}>💡 Tip: {detail.tips}</Text>
              </View>
            )}
          </AppCard>

          {/* Planificación */}
          <AppCard>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 }}>
              Tu planificación
            </Text>
            <SeriesRow label="Objetivo" value={`${params.series || 0} series x ${params.reps || 0} reps`} />
            <SeriesRow label="Carga recomendada" value={params.load || "Libre"} />
            <SeriesRow label="Esfuerzo (RPE)" value={params.rpe || ""} />
          </AppCard>
        </View>
      </ScrollView>

      {/* Botón flotante para Iniciar Secuencia */}
      <View style={styles.floatingContainer}>
        <WebSemanticButton 
          label="Iniciar Secuencia"
          icon="play"
          tone="primary"
          onPress={() => setShowSequenceModal(true)}
        />
      </View>
      {/* Modal Gráfico de Evolución */}
      <RNModal visible={showChartModal} animationType="slide" transparent={true} onRequestClose={() => setShowChartModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            
            <View style={modalStyles.header}>
              <View style={modalStyles.headerContent}>
                <View style={modalStyles.iconBox}>
                  <MaterialCommunityIcons name="chart-line" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={modalStyles.title}>Evolución</Text>
                  <Text style={modalStyles.subtitle}>{detail?.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowChartModal(false)} style={modalStyles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.yellowAccent} />
            
            <View style={[modalStyles.content, { paddingBottom: 32 }]}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {[
                  { id: 'carga', label: 'Carga Máx', color: colors.primary },
                  { id: 'rpe', label: 'RPE', color: colors.accent },
                  { id: 'dolor', label: 'Dolor', color: '#EF4444' },
                  { id: 'volumen', label: 'Volumen', color: '#8B5CF6' }
                ].map(tab => (
                  <TouchableOpacity 
                    key={tab.id}
                    onPress={() => setChartType(tab.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: chartType === tab.id ? tab.color : '#F1F5F9',
                      marginRight: 8
                    }}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: '800', 
                      color: chartType === tab.id ? '#fff' : '#64748B' 
                    }}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ alignItems: 'center', overflow: 'hidden' }}>
              <LineChart
                data={[...(detail?.historial || [])].reverse().map(h => {
                  let val = 0;
                  if (chartType === 'carga') val = parseFloat(h.carga || 0);
                  if (chartType === 'rpe') val = parseFloat(h.rpe || 0);
                  if (chartType === 'dolor') val = parseFloat(h.dolor || 0);
                  if (chartType === 'volumen') {
                     let reps = 0;
                     if (h.detalle_series && Array.isArray(h.detalle_series) && h.detalle_series.length > 0) {
                        reps = h.detalle_series.reduce((acc, s) => acc + parseInt(s.reps || 0), 0);
                     } else {
                        reps = parseInt(h.series || 0) * 5; // Estimación si no hay detalle
                     }
                     val = parseFloat(h.carga || 0) * reps;
                  }
                  return {
                    value: val,
                    label: new Date(h.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    dataPointText: `${val}`
                  };
                })}
                width={280}
                height={180}
                spacing={65}
                initialSpacing={20}
                color={
                  chartType === 'carga' ? colors.primaryStrong : 
                  chartType === 'rpe' ? colors.accent : 
                  chartType === 'dolor' ? '#EF4444' : '#8B5CF6'
                }
                thickness={3}
                dataPointsColor={
                  chartType === 'carga' ? colors.primary : 
                  chartType === 'rpe' ? colors.accent : 
                  chartType === 'dolor' ? '#EF4444' : '#8B5CF6'
                }
                textFontSize={11}
                textColor={colors.textSoft}
                hideRules
                yAxisColor="transparent"
                xAxisColor="rgba(0,0,0,0.1)"
                yAxisTextStyle={{ color: colors.textSoft, fontSize: 10 }}
                noOfSections={4}
                isAnimated
              />
            </View>
          </View>
        </View>
        </View>
      </RNModal>

      {/* Modal de Secuencia de Ejecución */}
      {detail && (
        <SecuenciaEjecucionModal 
          visible={showSequenceModal}
          onClose={() => setShowSequenceModal(false)}
          onSave={handleSaveSequence}
          exerciseName={detail.name}
          initialSeries={parseInt(params.series) || 5}
        />
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  floatingContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderColor: colors.border,
  }
});
