import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { getBottomSafePadding, getScreenTopPadding } from '../../theme/layout';
import { modalStyles } from '../../theme/modalStyles';
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
      const plannedLoad = getPlannedLoadValue(planned, initialLoad);
      return {
        id: i + 1,
        carga: saved?.carga ? String(saved.carga) : plannedLoad.value,
        reps: saved?.reps ? String(saved.reps) : String(planned.reps || initialReps || ''),
        targetLoad: plannedLoad.hint,
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
        {/* Header Modal */}
        <View style={modalStyles.header}>
          <View style={modalStyles.headerContent}>
            <View style={modalStyles.iconBox}>
              <MaterialCommunityIcons name="play-circle-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.title}>Secuencia de Ejecución</Text>
              <Text style={modalStyles.subtitle} numberOfLines={1}>{exerciseName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={modalStyles.yellowAccent} />

        <ScrollView style={modalStyles.content} contentContainerStyle={{ paddingBottom: 20 }}>
          
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
        <View style={[styles.footer, { paddingBottom: getBottomSafePadding(insets.bottom, 16) }]}>
          <View style={styles.footerButton}>
            <WebSemanticButton 
              label="Cancelar"
              icon="close"
              tone="danger"
              borderWidth={1}
              onPress={onClose}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.footerButton}>
            <WebSemanticButton 
              label="Guardar"
              icon="content-save"
              tone="primary"
              onPress={handleSave}
              style={styles.actionButton}
            />
          </View>
        </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function normalizeInitialLoad(value) {
  if (!value || value === 'Libre') return '';
  if (String(value).includes('%')) return '';
  return String(value).replace(/[^\d.,]/g, '');
}

function getPlannedLoadValue(planned, fallbackLoad) {
  const roundedLoad = planned?.prescripcion_carga?.carga_redondeada;
  if (roundedLoad != null && Number.isFinite(Number(roundedLoad))) {
    const kg = formatKg(roundedLoad);
    return {
      value: kg,
      hint: `${kg} kg plan`,
    };
  }

  const targetLoad = planned?.target_load || fallbackLoad || '';
  if (String(targetLoad).includes('%')) {
    return {
      value: '',
      hint: 'RM pendiente',
    };
  }

  const normalized = normalizeInitialLoad(targetLoad);
  return {
    value: normalized,
    hint: normalized ? `${normalized} kg plan` : targetLoad || 'Libre',
  };
}

function formatKg(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return String(Math.round(number * 100) / 100).replace(/\.00$/, '');
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  actionButton: {
    minHeight: 44,
    backgroundColor: colors.surface,
  },
});
