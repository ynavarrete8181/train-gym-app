import { StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";

const toneMap = {
  primary: { color: colors.primaryStrong, bg: colors.primaryPale, border: "rgba(242, 177, 0, 0.45)" },
  success: { color: colors.success, bg: "rgba(46, 125, 50, 0.10)", border: "rgba(46, 125, 50, 0.30)" },
  danger: { color: colors.danger, bg: "rgba(220, 38, 38, 0.10)", border: "rgba(220, 38, 38, 0.30)" },
  warning: { color: colors.warning, bg: "rgba(242, 177, 0, 0.13)", border: "rgba(242, 177, 0, 0.45)" },
  neutral: { color: colors.text, bg: "rgba(15, 23, 42, 0.06)", border: "rgba(15, 23, 42, 0.14)" },
  purple: { color: colors.purple, bg: colors.purpleSoft, border: "rgba(139, 92, 246, 0.30)" },
};

export default function AppBadge({ children, tone = "neutral", style }) {
  const config = toneMap[tone] || toneMap.neutral;

  return (
    <Text style={[styles.badge, { color: config.color, backgroundColor: config.bg, borderColor: config.border }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
