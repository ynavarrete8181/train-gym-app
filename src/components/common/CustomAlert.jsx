import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebSemanticButton from "./WebSemanticButton";
import { colors } from "../../theme/colors";
import { getBottomSafePadding, getScreenTopPadding } from "../../theme/layout";

export default function CustomAlert({ visible, title, message, type = "success", onClose }) {
  const insets = useSafeAreaInsets();

  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "check-circle-outline",
          color: colors.success,
          tone: "success",
          titleFallback: "Accion completada",
          eyebrow: "Confirmacion",
        };
      case "error":
        return {
          icon: "close-circle-outline",
          color: colors.danger,
          tone: "danger",
          titleFallback: "No se pudo completar",
          eyebrow: "Error",
        };
      case "warning":
        return {
          icon: "alert-circle-outline",
          color: colors.accentDark,
          tone: "mustard",
          titleFallback: "Revisa la informacion",
          eyebrow: "Atencion",
        };
      default:
        return {
          icon: "information-outline",
          color: colors.blue,
          tone: "neutral",
          titleFallback: "Informacion",
          eyebrow: "Aviso",
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          {
            paddingTop: getScreenTopPadding(insets.top, 18),
            paddingBottom: getBottomSafePadding(insets.bottom, 18),
          },
        ]}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { borderColor: `${config.color}55` }]}>
                <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
              </View>
              <Text style={styles.eyebrow}>{config.eyebrow}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.accentLine, { backgroundColor: config.color }]} />

          <View style={styles.content}>
            <View style={[styles.heroIcon, { backgroundColor: `${config.color}14`, borderColor: `${config.color}33` }]}>
              <MaterialCommunityIcons name={config.icon} size={42} color={config.color} />
            </View>
            <Text style={styles.title}>{title || config.titleFallback}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.footer}>
            <WebSemanticButton
              label="Aceptar"
              icon="check"
              tone={config.tone}
              onPress={onClose}
              borderWidth={1.5}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  header: {
    minHeight: 58,
    backgroundColor: colors.secondary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
  },
  accentLine: {
    height: 4,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 15,
    color: colors.textSoft,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  actionButton: {
    minWidth: 132,
  },
});
