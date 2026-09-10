import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import apiClient, { normalizeApiError } from "../api/apiClient";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import LoadingView from "../components/common/LoadingView";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function CambiarPasswordTemporalPage() {
  const router = useRouter();
  const { booting, isAuthenticated, user, refreshUser, signOut } = useAuth();
  const [form, setForm] = useState({
    password_actual: "",
    password: "",
    password_confirmation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (booting) {
    return <LoadingView message="Validando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!user?.requiere_cambio_password) {
    return <Redirect href="/(tabs)/home" />;
  }

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const actual = form.password_actual.trim();
    const nueva = form.password.trim();
    const confirmar = form.password_confirmation.trim();

    if (!actual || !nueva || !confirmar) {
      Alert.alert("Datos incompletos", "Ingresa la clave temporal y confirma tu nueva contraseña.");
      return;
    }

    if (nueva.length < 8) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nueva !== confirmar) {
      Alert.alert("Revisa la contraseña", "La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/auth/cambiar-password-temporal", {
        password_actual: actual,
        password: nueva,
        password_confirmation: confirmar,
      });
      await refreshUser();
      Alert.alert("Contraseña actualizada", "Ya puedes usar la aplicación normalmente.");
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar",
        normalizeApiError(error, "Verifica la clave temporal e intenta nuevamente.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="lock-reset" color={colors.white} size={28} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Cambia tu contraseña</Text>
              <Text style={styles.subtitle}>Tu cuenta tiene una clave temporal de acceso.</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.notice}>
              <MaterialCommunityIcons
                name="shield-key-outline"
                color={colors.primaryStrong}
                size={22}
              />
              <Text style={styles.noticeText}>
                Por seguridad, crea una contraseña personal antes de continuar.
              </Text>
            </View>

            <AppInput
              label="Clave temporal"
              value={form.password_actual}
              onChangeText={(value) => setField("password_actual", value)}
              secureTextEntry
              autoCapitalize="none"
              disabled={submitting}
            />
            <AppInput
              label="Nueva contraseña"
              value={form.password}
              onChangeText={(value) => setField("password", value)}
              secureTextEntry
              autoCapitalize="none"
              disabled={submitting}
            />
            <AppInput
              label="Confirmar nueva contraseña"
              value={form.password_confirmation}
              onChangeText={(value) => setField("password_confirmation", value)}
              secureTextEntry
              autoCapitalize="none"
              disabled={submitting}
            />

            <View style={styles.actions}>
              <AppButton
                mode="outlined"
                icon="logout"
                onPress={signOut}
                disabled={submitting}
                style={styles.secondaryButton}
              >
                Cerrar sesión
              </AppButton>
              <AppButton
                mode="contained"
                icon="content-save"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
                style={styles.primaryButton}
              >
                Guardar
              </AppButton>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  headerIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
  },
  body: {
    gap: 14,
    padding: 18,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(242,177,0,0.28)",
    backgroundColor: colors.primaryPale,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.danger,
  },
  primaryButton: {
    flex: 1,
    borderColor: colors.primary,
  },
});
