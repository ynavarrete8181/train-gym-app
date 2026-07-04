import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";

export default function LoadingView({ message = "Cargando..." }) {
  return (
    <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center", gap: 14 }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textSoft }}>{message}</Text>
    </View>
  );
}
