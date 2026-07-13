import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../utils/storageKeys";

const configuredBaseUrl = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8002").trim();
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

export const normalizeApiError = (error, fallbackMessage = "Ocurrió un error al procesar la solicitud.") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder. Intenta nuevamente.";
  }

  if (!error?.response) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté activo y accesible.";
  }

  if (error?.response?.status >= 500) {
    return "El servidor encontró un problema al procesar el inicio de sesión.";
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
