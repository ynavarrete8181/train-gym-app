import { ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Chip, Text } from "react-native-paper";
import AppButton from "../../components/common/AppButton";
import AppCard from "../../components/common/AppCard";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../features/dashboard/useDashboard";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data } = useDashboard();
  const deuda = data?.deuda;
  const membresia = data?.membresia;

  return (
    <ScrollView
      style={appStyles.screen}
      contentContainerStyle={[appStyles.container, { gap: 18, paddingBottom: 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>Perfil</Text>

      <AppCard style={{ backgroundColor: colors.secondary, borderColor: "rgba(255,255,255,0.06)" }}>
        <View style={{ gap: 14 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="account-circle-outline" size={42} color="#fff" />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
              {user?.name || "Usuario"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.72)" }}>{user?.email || "Sin correo"}</Text>
            <Chip
              mode="flat"
              style={{ alignSelf: "flex-start", backgroundColor: colors.primary }}
              textStyle={{ color: colors.text, fontWeight: "900" }}
            >
              Rol: {user?.role || "CLIENTE"}
            </Chip>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Estado de cuenta
          </Text>
          <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
            {membresia
              ? `${membresia.nombre} vigente hasta ${new Date(membresia.fecha_fin).toLocaleDateString()}.`
              : "Sin membresía activa registrada en este momento."}
          </Text>
          <Text style={{ color: deuda?.tiene_deuda ? "#b91c1c" : colors.textSoft, lineHeight: 22, fontWeight: "700" }}>
            {deuda?.tiene_deuda
              ? `Mantienes un saldo pendiente de $${parseFloat(deuda.saldo_total || 0).toFixed(2)}.`
              : "No tienes deudas pendientes con caja."}
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Sesión
          </Text>
          <AppButton mode="outlined" onPress={signOut}>
            Cerrar sesión
          </AppButton>
        </View>
      </AppCard>
    </ScrollView>
  );
}
