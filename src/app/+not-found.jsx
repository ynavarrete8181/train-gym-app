import { Link } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";
import AppButton from "../components/common/AppButton";
import { appStyles } from "../theme/theme";
import { colors } from "../theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={[appStyles.screen, appStyles.container, { justifyContent: "center", gap: 18 }]}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>Pantalla no encontrada</Text>
      <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
        La ruta que intentaste abrir no existe en esta versión de la app.
      </Text>
      <Link href="/(tabs)/home" asChild>
        <AppButton>Volver al inicio</AppButton>
      </Link>
    </View>
  );
}
