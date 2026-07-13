import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { appStyles } from "../theme/theme";
import { getBottomSafePadding, getScreenTopPadding } from "../theme/layout";

import CustomAlert from "../components/common/CustomAlert";

const schema = z.object({
  cedula: z
    .string()
    .trim()
    .min(8, "Ingresa una cédula válida.")
    .regex(/^[0-9]+$/, "La cédula solo debe contener números."),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres."),
});

export default function LoginPage() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scrollRef = useRef(null);
  const cedulaRef = useRef(null);
  const passwordRef = useRef(null);
  
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      cedula: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        setSubmitting(true);
        await signIn(values);
        router.replace("/(tabs)/home");
      } catch (error) {
        showAlert("Error", error.message || "No se pudo iniciar sesión.", "error");
      } finally {
        setSubmitting(false);
      }
    },
    () => {
      const firstError = errors.cedula?.message || errors.password?.message;
      if (firstError) {
        showAlert("Datos incompletos", firstError, "warning");
      }
    }
  );

  const overlayInputBase = {
    position: "absolute",
    left: "20.2%",
    right: "22.8%",
    height: 34,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    overflow: "hidden",
  };

  const overlayTextInputBase = {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: "#707783",
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 6 : 0,
    paddingBottom: 0,
    margin: 0,
    textAlignVertical: "center",
  };

  const scrollToField = (y) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    });
  };

  return (
    <View style={[appStyles.screen, { backgroundColor: colors.black }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 18}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            minHeight: height + getScreenTopPadding(insets.top) + Math.max(insets.bottom, 12),
            backgroundColor: colors.black,
          }}
        >
          <ImageBackground
            source={require("../../assets/images/revive-login-reference.png")}
            resizeMode="cover"
            style={{
              height: height + Math.max(insets.bottom, 12),
              minHeight: height + Math.max(insets.bottom, 12),
              backgroundColor: colors.black,
            }}
          >
            <View style={{ flex: 1 }}>
              {submitting ? (
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.28)",
                    zIndex: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      minWidth: 220,
                      paddingHorizontal: 22,
                      paddingVertical: 18,
                      borderRadius: 18,
                      backgroundColor: "rgba(12, 12, 12, 0.92)",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <ActivityIndicator size="large" color={colors.gold} />
                    <View>
                      <Text
                        style={{
                          color: colors.white,
                          fontSize: 17,
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                      >
                        Validando acceso...
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          color: "rgba(255,255,255,0.72)",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        Iniciando sesión en Revive Sports
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              <View
                pointerEvents="none"
                style={[
                  overlayInputBase,
                  {
                    top: "52.35%",
                  },
                ]}
              />

              <Controller
                control={control}
                name="cedula"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={cedulaRef}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => scrollToField(height * 0.12)}
                    keyboardType="numeric"
                    autoCorrect={false}
                    autoCapitalize="none"
                    placeholder=""
                    selectionColor={colors.gold}
                    cursorColor={colors.gold}
                    style={{
                      position: "absolute",
                      left: "23.8%",
                      right: "21.5%",
                      top: "52.45%",
                      height: 32,
                      ...overlayTextInputBase,
                    }}
                  />
                )}
              />

              <View
                pointerEvents="none"
                style={[
                  overlayInputBase,
                  {
                    top: "62.15%",
                    right: "27%",
                  },
                ]}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={passwordRef}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => scrollToField(height * 0.2)}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    autoCapitalize="none"
                    placeholder=""
                    selectionColor={colors.gold}
                    cursorColor={colors.gold}
                    style={{
                      position: "absolute",
                      left: "23.8%",
                      right: "27.4%",
                      top: "62.25%",
                      height: 32,
                      ...overlayTextInputBase,
                    }}
                  />
                )}
              />

            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={10}
              style={{
                position: "absolute",
                right: "18.7%",
                top: "61.8%",
                width: 44,
                height: 44,
              }}
            />

            <Pressable
              style={{
                position: "absolute",
                right: "15.8%",
                top: "68.1%",
                width: 210,
                height: 28,
              }}
            />

            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              style={{
                position: "absolute",
                left: "18.2%",
                right: "18.2%",
                top: "72.6%",
                height: 74,
                borderRadius: 18,
              }}
            />

            <Pressable
              style={{
                position: "absolute",
                left: "49%",
                right: "18.5%",
                bottom: getBottomSafePadding(insets.bottom, 10),
                height: 28,
              }}
            />
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}
