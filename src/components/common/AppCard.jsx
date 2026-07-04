import { View } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { shadows } from "../../theme/shadows";

export default function AppCard({ children, style, tone = "default" }) {
  const toneStyle = tone === "active"
    ? { borderColor: colors.accent, backgroundColor: colors.white }
    : null;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          ...shadows.card,
        },
        toneStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}
