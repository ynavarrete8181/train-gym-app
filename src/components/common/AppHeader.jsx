import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

export default function AppHeader({
  icon = "view-dashboard-outline",
  title,
  subtitle,
  right,
  showBack = false,
  showSettings = false,
  onBack,
  onSettings,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (showBack) {
    return (
      <View style={[styles.compactHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.compactRow}>
          <Pressable style={styles.compactBackButton} onPress={onBack || (() => router.back())}>
            <MaterialCommunityIcons name="arrow-left" size={23} color={colors.white} />
          </Pressable>
          <View style={styles.compactCopy}>
            <Text style={styles.compactTitle}>{title}</Text>
            {subtitle ? <Text style={styles.compactSubtitle}>{subtitle}</Text> : null}
          </View>
          {right}
          {showSettings ? (
            <Pressable style={styles.settingsButton} onPress={onSettings}>
              <MaterialCommunityIcons name="cog-outline" size={24} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const canShowActions = showSettings || right;

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      {canShowActions ? (
        <View style={styles.actionsRow}>
          <View />
          <View style={styles.headerActions}>
            {right}
            {showSettings ? (
              <Pressable style={styles.settingsButton} onPress={onSettings}>
                <MaterialCommunityIcons name="cog-outline" size={24} color={colors.white} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={28} color={colors.secondary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary,
  },
  compactHeader: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compactBackButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  compactCopy: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
  },
  compactSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  actionsRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    lineHeight: 19,
  },
  right: {
    alignItems: "flex-end",
  },
});
