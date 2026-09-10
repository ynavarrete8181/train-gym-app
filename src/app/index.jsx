import { Redirect } from "expo-router";
import LoadingView from "../components/common/LoadingView";
import { useAuth } from "../context/AuthContext";

export default function IndexPage() {
  const { booting, isAuthenticated, user } = useAuth();

  if (booting) {
    return <LoadingView message="Preparando tu experiencia..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (user?.requiere_cambio_password) {
    return <Redirect href="/cambiar-password-temporal" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
