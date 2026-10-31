import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import apiClient, { normalizeApiError } from "../api/apiClient";
import { clearSession, getStoredSession, saveSession } from "../api/authStorage";
import { registerPushDevice } from "../features/notifications/pushNotificationService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

  const persistSession = useCallback(async (nextToken, nextUser) => {
    await saveSession({ token: nextToken, user: nextUser });
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await getStoredSession();
        if (!stored.accessToken) {
          setUser(null);
          setToken(null);
          return;
        }

        setToken(stored.accessToken);

        try {
          const { data: profile } = await apiClient.get("/base/auth/me");
          const normalizedUser = profile?.datos?.usuario || profile?.user || profile?.usuario || null;
          if (!normalizedUser) throw new Error("La API no devolvió el usuario.");
          await persistSession(stored.accessToken, normalizedUser);
        } catch (_error) {
          await clearSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, [persistSession]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    registerPushDevice().catch(() => {
      // El registro push no debe bloquear el uso normal de la app.
    });
  }, [token, user]);

  const signIn = useCallback(async (credentials) => {
    try {
      const email = String(credentials?.email || "").trim().toLowerCase();
      const { data } = await apiClient.post("/base/auth/login", {
        email,
        password: credentials?.password || "",
      });
      const nextToken = data?.datos?.token || data?.token || data?.access_token || null;
      const nextUser = data?.datos?.usuario || data?.user || null;

      if (!nextToken || !nextUser) {
        throw new Error("El backend no devolvió una sesión válida.");
      }

      await persistSession(nextToken, nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(normalizeApiError(error, "No se pudo iniciar sesión."));
    }
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    const { data: profile } = await apiClient.get("/base/auth/me");
    const nextUser = profile?.datos?.usuario || profile?.user || profile?.usuario || null;
    if (!nextUser) throw new Error("La API no devolvió el usuario.");
    await persistSession(token, nextUser);
    return nextUser;
  }, [persistSession, token]);

  const updateUser = useCallback(
    async (nextUser) => {
      if (!token || !nextUser) {
        return;
      }

      await persistSession(token, nextUser);
    },
    [persistSession, token]
  );

  const signOut = useCallback(async () => {
    try {
      if (token) {
        await apiClient.post("/base/auth/logout");
      }
    } catch (_error) {
      // Si el token ya expiró o el backend no responde, igual cerramos la sesión local.
    }

    await clearSession();
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
      refreshUser,
      updateUser,
    }),
    [user, token, booting, signIn, signOut, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
};
