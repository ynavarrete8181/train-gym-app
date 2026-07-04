import { View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../../theme/colors";

export default function LoginHeader() {
  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(216, 161, 6, 0.24)",
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "900", color: colors.primaryStrong }}>TG</Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 36, lineHeight: 42, fontWeight: "900", color: colors.text }}>
          Bienvenido a Train Gym
        </Text>
        <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
          Accede a tu rutina, progreso y seguimiento diario desde una experiencia limpia y enfocada.
        </Text>
      </View>
    </View>
  );
}
