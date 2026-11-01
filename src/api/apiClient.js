import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../utils/storageKeys";

const configuredBaseUrl = (process.env.EXPO_PUBLIC_API_URL || "https://revivesportapi.up.railway.app").trim();
const rawBaseUrl =
  Platform.OS === "android"
    ? configuredBaseUrl.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2")
    : configuredBaseUrl.replace("10.0.2.2", "localhost");
const API_BASE_ORIGIN = rawBaseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: `${rawBaseUrl.replace(/\/$/, "")}/api`,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Evita mostrar claves internas de traducción o mensajes técnicos del servidor.
const isTranslationKey = (value) =>
  /^(?:validation|auth|passwords|errors)\.[a-z0-9_.-]+$/i.test(String(value || "").trim());

const readableValidationError = (errors) => {
  if (!errors || typeof errors !== "object") return null;

  const labels = {
    identificador: "La cédula o correo electrónico",
    cedula: "La cédula",
    email: "El correo electrónico",
    password: "La contraseña",
  };
  const fields = Object.keys(errors);
  for (const field of fields) {
    const detail = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
    if (typeof detail === "string" && detail.trim() && !isTranslationKey(detail)) {
      return detail;
    }
    if (labels[field]) return `${labels[field]} es un campo obligatorio o tiene un formato inválido.`;
  }
  return null;
};

export const normalizeApiError = (error, fallbackMessage = "Ocurrió un error al procesar la solicitud.") => {
  const status = error?.response?.status;
  const payload = error?.response?.data;
  const message = payload?.mensaje || payload?.message;

  if (error?.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder. Intenta nuevamente.";
  }

  if (!error?.response) {
    if (error?.isAxiosError || error?.request) {
      return "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
    }
    return typeof error?.message === "string" && !isTranslationKey(error.message)
      ? error.message
      : fallbackMessage;
  }

  if (status === 422) {
    return readableValidationError(payload?.errors)
      || "Revisa la cédula o correo electrónico y la contraseña ingresados.";
  }
  if (status === 401) return "Credenciales incorrectas. Verifica tus datos e intenta nuevamente.";
  if (status === 403) return "Tu cuenta no tiene permiso para realizar esta acción.";
  if (status === 429) return "Demasiados intentos. Espera un momento antes de volver a intentarlo.";
  if (status >= 500) return "El servidor encontró un problema. Intenta nuevamente más tarde.";

  if (typeof message === "string" && message.trim() && !isTranslationKey(message)) {
    return message;
  }

  return fallbackMessage;
};

export const normalizeAssetUrl = (url) => {
  if (!url) return "";

  const raw = String(url).trim();
  if (!raw) return "";

  if (raw.startsWith("/")) {
    return `${API_BASE_ORIGIN}${raw}`;
  }

  try {
    const parsed = new URL(raw);
    if (
      parsed.pathname.startsWith("/uploads/") &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname)
    ) {
      return `${API_BASE_ORIGIN}${parsed.pathname}`;
    }
  } catch {
    return raw;
  }

  return raw;
};

export default apiClient;
