import { View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function EmptyState({ title, subtitle, icon = "folder-open-outline" }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30, marginTop: 40, marginBottom: 40 }}>
      <View style={{ 
        width: 90, height: 90, borderRadius: 45, 
        backgroundColor: "rgba(109, 74, 255, 0.1)", 
        justifyContent: "center", alignItems: "center", 
        marginBottom: 24 
      }}>
        <MaterialCommunityIcons name={icon} size={42} color={colors.accentDark} />
      </View>
      <Text style={{ 
        fontSize: 22, fontWeight: "900", color: colors.text, 
        textAlign: "center", marginBottom: 12, letterSpacing: -0.5 
      }}>
        {title}
      </Text>
      <Text style={{ 
        fontSize: 15, color: colors.textSoft, 
        textAlign: "center", lineHeight: 22, paddingHorizontal: 10
      }}>
        {subtitle}
      </Text>
    </View>
  );
}
