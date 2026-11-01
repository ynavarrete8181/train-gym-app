import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../../theme/colors";
import { getScreenTopPadding } from "../../../theme/layout";

const LOGO = require("../../../../assets/images/revive-official-home.png");

function shortName(name) {
  if (typeof name === "object") name = name?.nombres || name?.name;
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  return words[0] || "deportista";
}

export default function HomeHero({ name, plan, topInset, onNotifications, onHelp }) {
  const completed = Math.max(0, Number(plan?.ejerciciosCompletados || 0));
  const total = Math.max(0, Number(plan?.ejerciciosTotal || 0));
  const percent = Math.min(100, Math.max(0, Number(plan?.porcentaje || 0)));
  return (
    <View style={[styles.hero, { paddingTop: getScreenTopPadding(topInset, 3) }]}>
      <View style={styles.nav}>
        <Image source={LOGO} resizeMode="contain" style={styles.logo} accessibilityLabel="REVIVE SPORTS" />
        <View style={styles.actions}>
          <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel="Ayuda" style={styles.topButton}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.white} />
          </Pressable>
          <Pressable onPress={onNotifications} accessibilityRole="button" accessibilityLabel="Notificaciones" style={styles.topButton}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.white} />
          </Pressable>
        </View>
      </View>
      <View style={styles.welcome}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.hello} numberOfLines={1}>¡Hola, {shortName(name)}!</Text>
          <Text style={styles.subtitle}>
            {total > 0 ? `Has completado ${Math.min(completed, total)} de ${total} ejercicios de tu plan.` : "Play · Move · Revive"}
          </Text>
        </View>
        {total > 0 && <View style={styles.progress}>
          <MaterialCommunityIcons name="dumbbell" color={colors.accent} size={20} />
          <Text style={styles.progressLabel}>{percent}%</Text>
        </View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 58 },
  logo: { width: 174, height: 56 },
  actions: { flexDirection: "row", gap: 8 },
  topButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  welcome: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10, paddingBottom: 2 },
  welcomeCopy: { flex: 1, minWidth: 0 },
  hello: { fontSize: 20, fontWeight: "900", color: colors.white },
  subtitle: { marginTop: 4, fontSize: 12, color: "#D3DAE4", lineHeight: 17 },
  progress: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)" },
  progressLabel: { fontSize: 13, fontWeight: "900", color: colors.accent },
});