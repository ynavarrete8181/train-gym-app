import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebSemanticButton from './WebSemanticButton';

export default function CustomAlert({ visible, title, message, type = 'success', onClose }) {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle-outline', color: '#10B981', tone: 'success' }; // Verde
      case 'error':
        return { icon: 'close-circle-outline', color: '#EF4444', tone: 'danger' }; // Rojo
      case 'warning':
        return { icon: 'alert-circle-outline', color: '#F59E0B', tone: 'mustard' }; // Amarillo/Naranja
      default:
        return { icon: 'information-outline', color: '#3B82F6', tone: 'primary' }; // Azul
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { zIndex: 9999, elevation: 9999 }]}>
      <View style={styles.modalContainer}>
          
          {/* Header Oscuro */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Acento de color basado en el tipo */}
          <View style={[styles.accentLine, { backgroundColor: config.color }]} />

          {/* Cuerpo del mensaje */}
          <View style={styles.content}>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          {/* Footer con el botón de Aceptar */}
          <View style={styles.footer}>
            <WebSemanticButton
              label="ACEPTAR"
              icon="check"
              tone={config.tone}
              onPress={onClose}
              borderWidth={1}
            />
          </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#0F172A', // Azul oscuro
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  accentLine: {
    height: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  btnSave: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  btnSaveText: {
    fontWeight: '700',
    fontSize: 13,
  }
});
