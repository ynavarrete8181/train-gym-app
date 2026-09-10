import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";

export default function OutlineButton({ label, icon, onPress, color = colors.accent, style, disabled = false }) {
  const actionColor = disabled ? colors.textSoft : color;
  const textColor = disabled ? colors.textSoft : colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[
        {
          height: 44,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: actionColor,
          backgroundColor: "transparent",
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={actionColor} /> : null}
      <Text style={{ fontSize: 14, fontWeight: "900", color: textColor }}>{label}</Text>
      <MaterialCommunityIcons name="arrow-right" size={20} color={textColor} />
    </TouchableOpacity>
  );
}
