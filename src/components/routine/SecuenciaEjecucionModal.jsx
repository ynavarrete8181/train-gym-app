import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { getBottomSafePadding, getScreenTopPadding } from '../../theme/layout';
import WebSemanticButton from '../common/WebSemanticButton';

export default function SecuenciaEjecucionModal({
  visible,
  onClose,
  onSave,
  exerciseName,
  initialSeries = 5,
  initialReps = '',
  initialLoad = '',
  plannedSeries = [],
  initialExecution = null,
}) {
  const insets = useSafeAreaInsets();
  const [sets, setSets] = useState([]);
  
  const [rpe, setRpe] = useState(null);
  const [dolor, setDolor] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (!visible) return;

    const savedSeries = Array.isArray(initialExecution?.series) ? initialExecution.series : [];
    const rowsCount = Math.max(initialSeries, plannedSeries.length || 0, 1);
    const nextSets = Array.from({ length: rowsCount }).map((_, i) => {
      const saved = savedSeries[i];
      const planned = plannedSeries[i] || {};
      return {
        id: i + 1,
        carga: saved?.carga ? String(saved.carga) : normalizeInitialLoad(planned.target_load || initialLoad),
        reps: saved?.reps ? String(saved.reps) : String(planned.reps || initialReps || ''),
        targetLoad: planned.target_load || initialLoad || 'Libre',
        targetReps: planned.reps || initialReps || '',
        completed: Boolean(saved?.completado),
      };
    });

    const timeoutId = setTimeout(() => {
      setSets(nextSets);
      setRpe(initialExecution?.rpe ? Number(initialExecution.rpe) : null);
      setDolor(initialExecution?.dolor_nivel != null ? Number(initialExecution.dolor_nivel) : null);
      setObservaciones(initialExecution?.obs || '');
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [initialExecution, initialLoad, initialReps, initialSeries, plannedSeries, visible]);

  const toggleSet = (index) => {
    const newSets = [...sets];
    newSets[index].completed = !newSets[index].completed;
    setSets(newSets);
  };

  const handleSave = () => {
    const completadas = sets.filter(s => s.completed);
    let estado = 'PENDIENTE';
    if (completadas.length >= sets.length && sets.length > 0) estado = 'COMPLETADO';
    else if (completadas.length > 0) estado = 'PARCIAL';
    else estado = 'OMITIDO';

    onSave({
      estado,
      series: completadas.map(s => ({
        numero_serie: s.id,
        reps: s.reps,
        carga: s.carga,
        completado: true
      })),
      rpe_real: rpe,
      dolor_nivel: dolor,
      observaciones: observaciones
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        {/* Header Modal */}
        <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top, 12) }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerSubtitle}>Secuencia de Ejecución</Text>
            <Text style={styles.headerTitle}>{exerciseName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: getBottomSafePadding(insets.bottom, 28) }]}>
          
          {/* Tabla de Sets */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: 40 }]}>SET</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>CARGA (KG)</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>REPS</Text>
            <View style={{ width: 40, alignItems: 'center' }}>
              <MaterialCommunityIcons name="check" size={16} color={colors.textSoft} />
            </View>
          </View>

	          {sets.map((set, index) => (
	            <View key={set.id} style={styles.row}>
	              <Text style={styles.cellSet}>{set.id}</Text>
	              <View style={styles.inputCell}>
	                <TextInput 
	                  style={styles.cellInput} 
	                  value={set.carga} 
	                  keyboardType="numeric"
	                  onChangeText={(val) => {
	                    const newSets = [...sets];
	                    newSets[index].carga = val;
	                    setSets(newSets);
	                  }}
	                />
	                <Text style={styles.targetHint}>{set.targetLoad || 'Libre'}</Text>
	              </View>
	              <View style={styles.inputCell}>
	                <TextInput 
	                  style={styles.cellInput} 
	                  value={set.reps} 
	                  keyboardType="numeric"
	                  onChangeText={(val) => {
	                    const newSets = [...sets];
	                    newSets[index].reps = val;
	                    setSets(newSets);
	                  }}
	                />
	                <Text style={styles.targetHint}>{set.targetReps ? `${set.targetReps} plan` : 'Plan'}</Text>
	              </View>
	              <TouchableOpacity onPress={() => toggleSet(index)} style={styles.checkboxContainer}>
                <View style={[styles.checkbox, set.completed && styles.checkboxActive]}>
                  {set.completed && <MaterialCommunityIcons name="check" size={16} color={colors.white} />}
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* RPE Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Esfuerzo Percibido (RPE)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                <TouchableOpacity 
                  key={val} 
                  onPress={() => setRpe(val)}
                  style={[styles.circleOption, rpe === val && styles.circleActive]}
                >
                  <Text style={[styles.circleText, rpe === val && styles.circleTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nivel de Dolor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nivel Dolor (0-10)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                <TouchableOpacity 
                  key={val} 
                  onPress={() => setDolor(val)}
                  style={[styles.circleOption, dolor === val && styles.circleActive]}
                >
                  <Text style={[styles.circleText, dolor === val && styles.circleTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Observaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones <Text style={{fontWeight:'400', color:colors.textSoft}}>(opcional)</Text></Text>
            <TextInput
              style={styles.textArea}
              placeholder="Escribe cómo te sentiste, molestias, notas..."
              placeholderTextColor={colors.textSoft}
              multiline
              numberOfLines={3}
              value={observaciones}
              onChangeText={setObservaciones}
            />
          </View>
        </ScrollView>

        {/* Botones */}
        <View style={[styles.footer, { paddingBottom: getBottomSafePadding(insets.bottom, 12) }]}>
          <View style={{ flex: 1 }}>
            <WebSemanticButton 
              label="Cancelar"
              tone="danger"
              borderWidth={1}
              onPress={onClose}
              style={{ backgroundColor: colors.surface }}
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <WebSemanticButton 
              label="Guardar Secuencia"
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

function normalizeInitialLoad(value) {
  if (!value || value === 'Libre') return '';
  return String(value).replace(/[^\d.,]/g, '');
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    color: colors.white,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  cellSet: {
    width: 40,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSoft,
  },
  inputCell: {
    flex: 1,
    paddingRight: 8,
  },
  cellInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  targetHint: {
    marginTop: 3,
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkboxContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  selectorScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  circleOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSoft,
  },
  circleTextActive: {
    color: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  }
});
