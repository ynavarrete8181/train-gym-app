import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { modalStyles } from '../../theme/modalStyles';
import WebSemanticButton from '../common/WebSemanticButton';

export default function ExecutionModal({ visible, onClose, onSave, exercise }) {
  const [series, setSeries] = useState([]);
  const [obs, setObs] = useState('');
  const [rpe, setRpe] = useState(null);
  const [dolor, setDolor] = useState(null);

  // Inicializar las series basadas en el plan o en la ejecución previa
  useEffect(() => {
    if (visible && exercise) {
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
            reps: String(exercise.reps || ''),
            carga: '',
            completado: false
          };
        });
        setSeries(fullSeries);
        setObs(exercise.ejecucion.obs || '');
        setRpe(exercise.ejecucion.rpe ? parseFloat(exercise.ejecucion.rpe) : null);
        setDolor(exercise.ejecucion.dolor_nivel != null ? Number(exercise.ejecucion.dolor_nivel) : null);
      } else {
        // Generar series vacías basadas en la meta del plan
        const initialSeries = Array.from({ length: seriesCount }).map((_, index) => ({
          numero_serie: index + 1,
          reps: String(exercise.reps || ''),
          carga: '',
          completado: false
        }));
        setSeries(initialSeries);
        setObs('');
        setRpe(null);
        setDolor(null);
      }
    }
  }, [visible, exercise]);

  if (!exercise) return null;

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
      rpe_real: rpe,
      dolor_nivel: dolor,
      observaciones: obs
    });
  };

  const RPE_OPTIONS = [5, 6, 7, 8, 9, 10];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          
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
          <View style={modalStyles.footer}>
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
