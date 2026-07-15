import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { getBottomSafePadding, getScreenTopPadding } from '../../theme/layout';
import { modalStyles } from '../../theme/modalStyles';
import WebSemanticButton from '../common/WebSemanticButton';
import { calculateTemporaryRmLoads } from '../../features/routine/routineService';

export default function ExecutionModal({ visible, onClose, onSave, exercise }) {
  const insets = useSafeAreaInsets();
  const [series, setSeries] = useState([]);
  const [obs, setObs] = useState('');
  const [rpe, setRpe] = useState(null);
  const [dolor, setDolor] = useState(null);
  const [manualRm, setManualRm] = useState('');
  const [calculatedPlannedSeries, setCalculatedPlannedSeries] = useState(null);
  const [calculatingRm, setCalculatingRm] = useState(false);
  const [rmCalculationError, setRmCalculationError] = useState('');

  // Inicializar las series basadas en el plan o en la ejecución previa
  useEffect(() => {
    if (visible && exercise) {
      const timeoutId = setTimeout(() => {
        const seriesCount = exercise.series || 1;

        if (exercise.ejecucion && exercise.ejecucion.series && exercise.ejecucion.series.length > 0) {
          // Cargar desde DB (ejecución previa de hoy)
          const savedSeries = exercise.ejecucion.series;
          // Rellenar hasta la cantidad planificada si faltan series
          const fullSeries = Array.from({ length: seriesCount }).map((_, index) => {
            if (index < savedSeries.length) {
              return { ...savedSeries[index], numero_serie: index + 1 };
            }
            return {
              numero_serie: index + 1,
              reps: String(getPlannedSerie(index, exercise)?.reps || exercise.reps || ''),
              carga: getSuggestedLoad(index, exercise),
              completado: false
            };
          });
          setSeries(fullSeries);
          setObs(exercise.ejecucion.obs || '');
          setRpe(exercise.ejecucion.rpe ? parseFloat(exercise.ejecucion.rpe) : null);
          setDolor(exercise.ejecucion.dolor_nivel != null ? Number(exercise.ejecucion.dolor_nivel) : null);
          setManualRm(exercise.ejecucion.rm_estimado_temporal ? String(exercise.ejecucion.rm_estimado_temporal) : '');
          setCalculatedPlannedSeries(null);
          setRmCalculationError('');
        } else {
          // Generar series vacías basadas en la meta del plan
          const initialSeries = Array.from({ length: seriesCount }).map((_, index) => ({
            numero_serie: index + 1,
            reps: String(getPlannedSerie(index, exercise)?.reps || exercise.reps || ''),
            carga: getSuggestedLoad(index, exercise),
            completado: false
          }));
          setSeries(initialSeries);
          setObs('');
          setRpe(null);
          setDolor(null);
          setManualRm('');
          setCalculatedPlannedSeries(null);
          setRmCalculationError('');
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [visible, exercise]);

  if (!exercise) return null;

  const activeExercise = calculatedPlannedSeries
    ? { ...exercise, plannedSeries: calculatedPlannedSeries }
    : exercise;

  const updateSerie = (index, field, value) => {
    const newSeries = [...series];
    newSeries[index][field] = value;
    setSeries(newSeries);
  };

  const toggleSerieComplete = (index) => {
    const newSeries = [...series];
    newSeries[index].completado = !newSeries[index].completado;
    setSeries(newSeries);
  };

  const handleSave = () => {
    // Calcular el estado usando las series PLANIFICADAS, no solo las del array
    const seriesPlanificadas = exercise.series || series.length;
    const completadas = series.filter(s => s.completado).length;
    let estado = 'PENDIENTE';
    if (completadas >= seriesPlanificadas && seriesPlanificadas > 0) estado = 'COMPLETADO';
    else if (completadas > 0) estado = 'PARCIAL';
    else estado = 'OMITIDO';

    onSave({
      plan_ejercicio_id: exercise.plan_ejercicio_id,
      estado,
      series: series.filter(s => s.completado),
      rm_estimado_manual: normalizeNumericInput(manualRm),
      rpe_real: rpe,
      dolor_nivel: dolor,
      observaciones: obs
    });
  };

  const handleApplyTemporaryRm = async () => {
    const rm = normalizeNumericInput(manualRm);
    if (!rm) {
      setRmCalculationError('Ingresa un RM estimado válido.');
      return;
    }

    if (!exercise.plan_id || !exercise.plan_ejercicio_id) {
      setRmCalculationError('No se encontró el contexto del plan para calcular.');
      return;
    }

    try {
      setCalculatingRm(true);
      setRmCalculationError('');
      const result = await calculateTemporaryRmLoads({
        plan_id: exercise.plan_id,
        plan_ejercicio_id: exercise.plan_ejercicio_id,
        rm_estimado: rm,
      });
      const nextPlannedSeries = Array.isArray(result?.series) ? result.series : [];
      setCalculatedPlannedSeries(nextPlannedSeries);
      setSeries((currentSeries) => currentSeries.map((serie, index) => {
        const prescription = nextPlannedSeries[index]?.prescripcion_carga;
        return {
          ...serie,
          carga: prescription?.carga_redondeada
            ? String(Math.round(Number(prescription.carga_redondeada) * 100) / 100)
            : serie.carga,
        };
      }));
    } catch (_error) {
      setRmCalculationError('No se pudo calcular con ese RM estimado.');
    } finally {
      setCalculatingRm(false);
    }
  };

  const RPE_OPTIONS = [5, 6, 7, 8, 9, 10];
  const hasMissingRm = exercise.plannedSeries?.some((plannedSerie) => isMissingRmPrescription(plannedSerie));
  const manualRmNumber = normalizeNumericInput(manualRm);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.modalContainer,
            {
              marginTop: getScreenTopPadding(insets.top, 8),
              marginBottom: getBottomSafePadding(insets.bottom, 8),
            },
          ]}
        >
          
          {/* Header Oscuro (Estilo Web) */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerContent}>
              <View style={modalStyles.iconBox}>
                <MaterialCommunityIcons name="dumbbell" size={20} color={colors.text} />
              </View>
              <View>
                <Text style={modalStyles.title}>Registrar Ejecución</Text>
                <Text style={modalStyles.subtitle}>{exercise.name}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Acento Amarillo (Estilo Web) */}
          <View style={modalStyles.yellowAccent} />

          <ScrollView style={modalStyles.content}>
            {hasMissingRm ? (
              <View style={styles.temporaryRmCard}>
                <View style={styles.temporaryRmHeader}>
                  <MaterialCommunityIcons
                    name={calculatedPlannedSeries ? "check-circle" : "alert-circle-outline"}
                    size={18}
                    color={calculatedPlannedSeries ? colors.success : colors.warning}
                  />
                  <Text style={styles.temporaryRmTitle}>
                    No cuenta con RM registrado
                  </Text>
                </View>
                <View style={styles.temporaryRmRow}>
                  <TextInput
                    style={[styles.temporaryRmInput, { flex: 1 }]}
                    keyboardType="numeric"
                    value={manualRm}
                    onChangeText={(value) => {
                      setManualRm(value);
                      setCalculatedPlannedSeries(null);
                      setRmCalculationError('');
                    }}
                    placeholder="RM estimado"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={[
                      styles.temporaryRmApply,
                      (!manualRmNumber || calculatingRm) && styles.temporaryRmApplyDisabled,
                    ]}
                    onPress={handleApplyTemporaryRm}
                    disabled={!manualRmNumber || calculatingRm}
                  >
                    <MaterialCommunityIcons
                      name={calculatingRm ? "loading" : "check"}
                      size={22}
                      color={manualRmNumber && !calculatingRm ? "#10B981" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.temporaryRmText}>
                  {calculatedPlannedSeries
                    ? "Cargas calculadas por backend. Revisa los pesos de cada serie antes de iniciar."
                    : "Ingresa un RM estimado y presiona el visto verde para calcular los pesos de la sesión."}
                </Text>
                {rmCalculationError ? (
                  <Text style={styles.temporaryRmError}>{rmCalculationError}</Text>
                ) : null}
              </View>
            ) : null}
            
            {/* Tabla de Series */}
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 0.5 }]}>Set</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Carga (kg)</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Reps</Text>
              <Text style={[styles.columnHeader, { flex: 0.5, textAlign: 'center' }]}>✓</Text>
            </View>

            {series.map((item, index) => (
              <View key={index} style={[styles.tableRow, item.completado && styles.tableRowCompleted]}>
                <Text style={[styles.cellText, { flex: 0.5, fontWeight: '700' }]}>{index + 1}</Text>
                
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <TextInput
                    style={[styles.input, item.completado && styles.inputCompleted]}
                    keyboardType="numeric"
                    value={item.carga}
                    onChangeText={(val) => updateSerie(index, 'carga', val)}
                    placeholder="kg"
                    placeholderTextColor="#9CA3AF"
                  />
                  {getPlannedSerie(index, activeExercise)?.prescripcion_carga?.discos_por_lado?.length ? (
                    <Text style={styles.plateHint} numberOfLines={2}>
                      {formatBarSetup(getPlannedSerie(index, activeExercise).prescripcion_carga)}
                    </Text>
                  ) : isMissingRmPrescription(getPlannedSerie(index, activeExercise)) ? (
                    <Text style={styles.rmMissingHint} numberOfLines={3}>
                      RM pendiente. Calcula con un RM estimado antes de ejecutar.
                    </Text>
                  ) : null}
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <TextInput
                    style={[styles.input, item.completado && styles.inputCompleted]}
                    keyboardType="numeric"
                    value={item.reps}
                    onChangeText={(val) => updateSerie(index, 'reps', val)}
                    placeholder="reps"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.checkButton, item.completado && styles.checkButtonActive, { flex: 0.5 }]} 
                  onPress={() => toggleSerieComplete(index)}
                >
                  <MaterialCommunityIcons 
                    name="check" 
                    size={20} 
                    color={item.completado ? "#10B981" : "#D1D5DB"} 
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* RPE Selector Visual */}
            <View style={{ marginTop: 24 }}>
               <Text style={styles.label}>Esfuerzo Percibido (RPE)</Text>
              <View style={styles.rpeContainer}>
                {RPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.rpeButton,
                      rpe === opt && styles.rpeButtonActive,
                      rpe === opt && opt >= 9 && { borderColor: '#EF4444' }, // Rojo si es al fallo
                      rpe === opt && opt >= 7 && opt < 9 && { borderColor: colors.primary } // Naranja/Mustard si es duro
                    ]}
                    onPress={() => setRpe(opt)}
                  >
                    <Text style={[styles.rpeText, rpe === opt && { color: '#111827', fontWeight: '900' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nivel de Dolor */}
            <View style={{ marginTop: 24 }}>
              <Text style={styles.label}>Nivel Dolor (0-10)</Text>
              <View style={styles.rpeContainer}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.dolorButton,
                      dolor === opt && styles.dolorButtonActive,
                      dolor === opt && opt >= 7 && { borderColor: '#EF4444' },
                      dolor === opt && opt >= 4 && opt < 7 && { borderColor: '#F59E0B' },
                      dolor === opt && opt < 4 && { borderColor: '#10B981' },
                    ]}
                    onPress={() => setDolor(opt)}
                  >
                    <Text style={[
                      styles.dolorText,
                      dolor === opt && { fontWeight: '900', color: '#111827' },
                    ]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Observaciones */}
            <View style={{ marginTop: 24 }}>
              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                value={obs}
                onChangeText={setObs}
                placeholder="Anota dolores, sensaciones o mejoras..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

          </ScrollView>

          {/* Botones Inferiores Estilo Web */}
          <View style={[modalStyles.footer, { paddingBottom: getBottomSafePadding(insets.bottom, 10) }]}>
            <WebSemanticButton
              label="CANCELAR"
              icon="close"
              tone="danger"
              onPress={onClose}
              borderWidth={1}
            />
            <WebSemanticButton
              label="GUARDAR"
              icon="content-save"
              tone="primary"
              onPress={handleSave}
            />
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getPlannedSerie(index, exercise) {
  return Array.isArray(exercise?.plannedSeries) ? exercise.plannedSeries[index] : null;
}

function getSuggestedLoad(index, exercise) {
  const load = getPlannedSerie(index, exercise)?.prescripcion_carga?.carga_redondeada;
  return load ? String(Math.round(Number(load) * 100) / 100) : '';
}

function formatBarSetup(prescription) {
  const plates = Array.isArray(prescription?.discos_por_lado) ? prescription.discos_por_lado : [];
  if (!plates.length) return 'Solo barra';

  return `Por lado: ${plates
    .map((plate) => `${plate.cantidad}x${formatNumber(plate.peso)}`)
    .join(' + ')}`;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return String(Math.round(number * 100) / 100);
}

function isMissingRmPrescription(plannedSerie) {
  return String(plannedSerie?.tipo_carga || '').toUpperCase() === 'PORCENTAJE_RM'
    && plannedSerie?.prescripcion_carga
    && !plannedSerie.prescripcion_carga.carga_redondeada;
}

function normalizeNumericInput(value) {
  const number = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : null;
}

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tableRowCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6, // Border radius reducido
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  plateHint: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
  },
  rmMissingHint: {
    marginTop: 4,
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
  temporaryRmCard: {
    gap: 5,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  temporaryRmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  temporaryRmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  temporaryRmTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
  },
  temporaryRmInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },
  temporaryRmApply: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temporaryRmApplyDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  temporaryRmText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  temporaryRmError: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  inputCompleted: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  checkButton: {
    height: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#10B981', // Verde
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  rpeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rpeButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
  },
  rpeButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  rpeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dolorButton: {
    flex: 1,
    marginHorizontal: 1,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
  },
  dolorButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
  },
  dolorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  btnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EF4444', // Rojo
    borderRadius: 4,
  },
  btnCancelText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  btnSave: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F59E0B', // Naranja/Amarillo
    borderRadius: 4,
    backgroundColor: '#fff', // Puede ser blanco o rellenado, la web lo tiene con icono relleno
  },
  btnSaveText: {
    color: '#111827', // Texto oscuro como en la web
    fontWeight: '700',
    fontSize: 13,
  }
});
