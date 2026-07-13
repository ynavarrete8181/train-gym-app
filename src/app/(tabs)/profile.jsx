import { useRef } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Chip, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppCard from "../../components/common/AppCard";
import WebSemanticButton from "../../components/common/WebSemanticButton";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../features/dashboard/useDashboard";
import { appStyles } from "../../theme/theme";
import { colors } from "../../theme/colors";
import { getScreenBottomPadding, getScreenTopPadding } from "../../theme/layout";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { user, signOut } = useAuth();
  const { data, loading, reload } = useDashboard();
  const membresia = data?.membresia;
  const displayName = getUserValue(user, ["name", "nombre", "full_name", "nombre_completo"], "Usuario");
  const documentId = getUserValue(user, ["cedula", "documento", "identificacion", "dni"], "No registrado");
  const email = getUserValue(user, ["email", "correo"], "Sin correo registrado");
  const phone = getUserValue(user, ["telefono", "phone", "celular"], "Sin telefono registrado");
  const role = getUserValue(user, ["role", "rol", "perfil"], "CLIENTE");
  const sede = getUserValue(user, ["sede_nombre", "sede", "gym"], "Revive Sports");

  useRefreshOnFocus(scrollRef, reload, { skipInitial: true });

  return (
    <ScrollView
      ref={scrollRef}
      style={appStyles.screen}
      contentContainerStyle={[
        appStyles.container,
        {
          gap: 18,
          paddingTop: getScreenTopPadding(insets.top, 18),
          paddingBottom: getScreenBottomPadding(insets.bottom),
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />}
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
              {displayName}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.72)" }}>{email}</Text>
            <Chip
              mode="flat"
              style={{ alignSelf: "flex-start", backgroundColor: colors.primary }}
              textStyle={{ color: colors.text, fontWeight: "900" }}
            >
              Rol: {role}
            </Chip>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Datos del usuario
          </Text>
          <ProfileRow icon="card-account-details-outline" label="Cedula" value={documentId} />
          <ProfileRow icon="email-outline" label="Correo" value={email} />
          <ProfileRow icon="phone-outline" label="Telefono" value={phone} />
          <ProfileRow icon="map-marker-outline" label="Sede" value={sede} />
          <ProfileRow
            icon="ticket-confirmation-outline"
            label="Membresia"
            value={membresia ? `${membresia.nombre} hasta ${new Date(membresia.fecha_fin).toLocaleDateString()}` : "Sin membresia activa"}
          />
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            Sesión
          </Text>
          <WebSemanticButton
            label="Cerrar sesion"
            icon="logout"
            tone="danger"
            onPress={signOut}
            borderWidth={1.5}
            style={{ alignSelf: "stretch" }}
          />
        </View>
      </AppCard>
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.surfaceSoft,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <MaterialCommunityIcons name={icon} size={19} color={colors.textSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: "900", color: colors.textSoft, textTransform: "uppercase" }}>
          {label}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 14, fontWeight: "800", color: colors.text }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function getUserValue(user, keys, fallback) {
  const found = keys.map((key) => user?.[key]).find((value) => value !== null && value !== undefined && String(value).trim() !== "");
  return found ? String(found) : fallback;
}
