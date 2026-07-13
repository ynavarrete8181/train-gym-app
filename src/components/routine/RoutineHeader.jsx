import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppCard from "../common/AppCard";
import { colors } from "../../theme/colors";
import WebSemanticButton from "../common/WebSemanticButton";
import { typography } from "../../theme/typography";

export default function RoutineHeader({ planName, dayLabel, weekLabel, summary }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primaryStrong} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.planTitle}>{planName}</Text>
          <Text style={styles.planMeta}>
            {weekLabel} · {dayLabel}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
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

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconTile: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: colors.primaryPale,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  planTitle: {
    ...typography.itemTitle,
  },
  planMeta: {
    ...typography.itemSubtitle,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
});
