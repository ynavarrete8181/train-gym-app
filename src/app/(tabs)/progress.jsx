import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Chip, Text } from "react-native-paper";
import AppCard from "../../components/common/AppCard";
import { getProgressSummary } from "../../features/progress/progressService";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";

export default function ProgressPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getProgressSummary().then(setSummary);
  }, []);

  if (!summary) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={appStyles.screen}
      contentContainerStyle={[appStyles.container, { gap: 18, paddingBottom: 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>Tu progreso</Text>
        <Text style={{ color: colors.textSoft, lineHeight: 21 }}>
          Indicadores simples para entender cómo vienes avanzando y qué debemos ajustar.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <AppCard style={{ flex: 1, minWidth: 150, backgroundColor: colors.surfaceAlt }}>
          <View style={{ gap: 8 }}>
            <MaterialCommunityIcons name="percent-circle-outline" size={28} color={colors.primaryStrong} />
            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textSoft }}>Adherencia</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>{summary.adherence}%</Text>
          </View>
        </AppCard>

        <AppCard style={{ flex: 1, minWidth: 150, backgroundColor: colors.surfaceAlt }}>
          <View style={{ gap: 8 }}>
            <MaterialCommunityIcons name="calendar-check-outline" size={28} color={colors.accent} />
            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textSoft }}>Sesiones</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>{summary.sessions}</Text>
          </View>
        </AppCard>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Resumen actual
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Chip mode="outlined">Dolor promedio: {summary.painAverage}</Chip>
            <Chip mode="outlined">Cumplimiento estable</Chip>
          </View>
          <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
            Tu comportamiento reciente indica una evolución sostenida. La clave ahora es mantener consistencia y calidad de ejecución.
          </Text>
        </View>
      </AppCard>

      <AppCard style={{ backgroundColor: colors.surfaceAlt }}>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Próximo enfoque
          </Text>
          <Text style={{ color: colors.textSoft, lineHeight: 22 }}>{summary.nextGoal}</Text>
        </View>
      </AppCard>
    </ScrollView>
  );
}
