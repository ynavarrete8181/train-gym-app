import { createContext, useContext, useEffect, useMemo, useState } from "react";
import apiClient, { normalizeApiError } from "../api/apiClient";
import { clearSession, getStoredSession, saveSession } from "../api/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

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
          const { data: profile } = await apiClient.get("/auth/me");
          const normalizedUser = profile?.user || profile;
          await saveSession({ token: stored.accessToken, user: normalizedUser });
          setUser(normalizedUser);
        } catch (error) {
          await clearSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (credentials) => {
    try {
      const documento = String(credentials?.cedula || "").trim();
      const { data } = await apiClient.post("/auth/login", {
        cedula: documento,
        password: credentials?.password || "",
      });
      const nextToken = data?.token || data?.access_token || null;
      const nextUser = data?.user || null;

      if (!nextToken || !nextUser) {
        throw new Error("El backend no devolvió una sesión válida.");
      }

      await saveSession({ token: nextToken, user: nextUser });
      setToken(nextToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(normalizeApiError(error, "No se pudo iniciar sesión."));
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      // Si el token ya expiró o el backend no responde, igual cerramos la sesión local.
    }

    await clearSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [user, token, booting]
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
