import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";

export default function OutlineButton({ label, icon, onPress, color = colors.accent, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        {
          height: 44,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: color,
          backgroundColor: "transparent",
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={color} /> : null}
      <Text style={{ fontSize: 14, fontWeight: "900", color: colors.text }}>{label}</Text>
      <MaterialCommunityIcons name="arrow-right" size={20} color={colors.text} />
    </TouchableOpacity>
  );
}
