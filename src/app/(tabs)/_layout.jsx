import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import LoadingView from "../../components/common/LoadingView";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const { booting, isAuthenticated } = useAuth();

  if (booting) {
    return <LoadingView message="Cargando panel..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "#D1D5DB",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarStyle: {
          backgroundColor: "#0F172A", // Dark navy background
          borderTopWidth: 0,
          height: 84, // iPhone safe area height usually needs a bit more room
          paddingTop: 8,
          paddingBottom: 28, // space for home indicator
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: "Rutina",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
