import { MD3LightTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const appTheme = {
  ...MD3LightTheme,
  roundness: 18,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceAlt,
    error: colors.danger,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSoft,
    outline: colors.border,
  },
};

export const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
  },
  premiumCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  // Estilos Generales Reutilizables (Botones, Modales, Chips)
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6, // Web uses 6px for chips/buttons
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pillButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 6, // Match web icon buttons radius
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700", // Web uses bold for buttons
    color: colors.textSoft,
  },
  buttonTextActive: {
    color: "#101010", // Web primary buttons have dark text
  },
});

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
};
