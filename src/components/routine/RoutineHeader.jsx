import { View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppCard from "../common/AppCard";
import { colors } from "../../theme/colors";
import WebSemanticButton from "../common/WebSemanticButton";
import { appStyles } from "../../theme/theme";

export default function RoutineHeader({ planName, dayLabel, weekLabel, summary }) {
  return (
    <AppCard style={[appStyles.premiumCard, { padding: 20, gap: 14 }]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ backgroundColor: colors.primarySoft, padding: 12, borderRadius: 8 }}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: "900", color: colors.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Plan Activo
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.text }}>{planName}</Text>
          <Text style={{ color: colors.textSoft, fontSize: 13, fontWeight: "500" }}>
            {weekLabel} · {dayLabel}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <WebSemanticButton 
          label={`${summary.exercises} ejercicios`} 
          size="small" 
          tone="neutral" 
          borderWidth={1}
        />
        <WebSemanticButton 
          label={`${summary.blocks} bloques`} 
          size="small" 
          tone="neutral" 
          borderWidth={1}
        />
        <WebSemanticButton 
          label={`${summary.completed} completados`} 
          size="small" 
          tone={summary.completed > 0 ? "success" : "neutral"} 
          borderWidth={1}
        />
      </View>
    </AppCard>
  );
}
