import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { getBottomSafePadding, getScreenTopPadding } from "../../theme/layout";

export default function AppModal({ visible, title, subtitle, icon = "information-outline", children, footer, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            {
              marginTop: getScreenTopPadding(insets.top, 18),
              marginBottom: getBottomSafePadding(insets.bottom, 18),
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={icon} size={22} color={colors.secondary} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.accent} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    maxHeight: "92%",
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white,
  },
  subtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  accent: {
    height: 4,
    backgroundColor: colors.primary,
  },
  content: {
    padding: 18,
    gap: 14,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#F8FAFC",
  },
});
