import { View } from "react-native";
import { Text } from "react-native-paper";
import AppCard from "./AppCard";
import { colors } from "../../theme/colors";

export default function EmptyState({ title, subtitle }) {
  return (
    <AppCard>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.textSoft, lineHeight: 21 }}>{subtitle}</Text>
      </View>
    </AppCard>
  );
}
