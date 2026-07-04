import { useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HelperText, Text } from "react-native-paper";
import AppButton from "../../../components/common/AppButton";
import { colors } from "../../../theme/colors";

function FieldShell({
  label,
  icon,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "900",
          color: colors.text,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          minHeight: 56,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.white,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <MaterialCommunityIcons name={icon} size={22} color="#8a919c" />
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#8B9098"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            paddingVertical: 10,
          }}
        />
        {rightIcon ? (
          <Pressable onPress={onRightPress} hitSlop={10}>
            <MaterialCommunityIcons name={rightIcon} size={22} color="#8a919c" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function LoginForm({ control, errors, submitting, onSubmit }) {
  const [secure, setSecure] = useState(true);

  return (
    <View style={{ gap: 12 }}>
      <Controller
        control={control}
        name="cedula"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <FieldShell
              label="Cédula"
              placeholder="Ingresa tu cédula"
              keyboardType="numeric"
              icon="card-account-details-outline"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            <HelperText type="error" visible={Boolean(errors.cedula)}>
              {errors.cedula?.message}
            </HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <FieldShell
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              secureTextEntry={secure}
              icon="lock-outline"
              rightIcon={secure ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setSecure((prev) => !prev)}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            <HelperText type="error" visible={Boolean(errors.password)}>
              {errors.password?.message}
            </HelperText>
          </View>
        )}
      />

      <Pressable style={{ alignSelf: "flex-end", marginTop: -2 }}>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
          ¿Olvidaste tu contraseña?{" "}
          <Text style={{ color: colors.gold, fontWeight: "900" }}>›</Text>
        </Text>
      </Pressable>

      <AppButton
        loading={submitting}
        onPress={onSubmit}
        icon="chevron-right"
        contentStyle={{ minHeight: 56, flexDirection: "row-reverse" }}
        labelStyle={{ fontSize: 17, fontWeight: "900" }}
        style={{
          borderRadius: 14,
          marginTop: 4,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        Ingresar
      </AppButton>
    </View>
  );
}
