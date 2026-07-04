import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { shadows } from "../../theme/shadows";

export default function QuickActionCard({ title, icon, iconColor, bgColor, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          paddingVertical: 14,
          paddingHorizontal: 8,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          ...shadows.card,
        },
        style,
      ]}
    >
      <View style={{ backgroundColor: bgColor, padding: 12, borderRadius: radius.md }}>
        <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      </View>
      <Text 
        style={{ fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" }} 
        numberOfLines={1} 
        adjustsFontSizeToFit
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
