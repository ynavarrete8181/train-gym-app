import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { appTheme } from "../theme/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exercise/[id]" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
