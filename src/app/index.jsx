import { Redirect } from "expo-router";
import LoadingView from "../components/common/LoadingView";
import { useAuth } from "../context/AuthContext";

export default function IndexPage() {
  const { booting, isAuthenticated } = useAuth();

  if (booting) {
    return <LoadingView message="Preparando tu experiencia..." />;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/login"} />;
}
