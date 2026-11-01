import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../../theme/colors";
import { getScreenTopPadding } from "../../../theme/layout";

function shortName(name) {
  if (typeof name === "object") name = name?.nombres || name?.name;
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  return words[0] || "deportista";
}

export default function HomeHero({ name, plan, topInset, onNotifications, onHelp }) {
  const completed = Number(plan?.ejerciciosCompletados ?? 0);
  const total = Number(plan?.ejerciciosTotal ?? 0);
  const percent = Math.min(100, Math.max(0, Number(plan?.porcentaje ?? 0)));
  return (
    <View style={[styles.hero, { paddingTop: getScreenTopPadding(topInset, 10) }]}>
      <View style={styles.nav}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Text style={styles.brandLetter}>R<Text style={styles.brandDot}>.</Text></Text></View>
          <Text style={styles.brandWhite}>EVIVE</Text><Text style={styles.brandGold}>SPORTS</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel="Ayuda" style={styles.topButton}>
            <MaterialCommunityIcons name="help-circle-outline" size={23} color={colors.white} />
          </Pressable>
          <Pressable onPress={onNotifications} accessibilityRole="button" accessibilityLabel="Notificaciones" style={styles.topButton}>
            <MaterialCommunityIcons name="bell-outline" size={23} color={colors.white} />
          </Pressable>
        </View>
      </View>
      <View style={styles.welcome}>
        <View style={styles.progressCircle}>
          <View style={styles.progressInner}><MaterialCommunityIcons name="dumbbell" size={28} color={colors.accent} /></View>
          <Text style={styles.progressText}>{total > 0 ? `${Math.min(completed, total)}/${total}` : "REVIVE"}</Text>
        </View>
        <View style={styles.welcomeCopy}>
          <Text style={styles.hello} numberOfLines={2}>¡Hola, {shortName(name)}!</Text>
          <Text style={styles.subtitle}>Tu próximo objetivo comienza con tu entrenamiento de hoy.</Text>
          {total > 0 ? <Text style={styles.achievement}>{percent}% de tu plan completado</Text> : <Text style={styles.achievement}>Play · Move · Revive</Text>}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primaryDark, paddingHorizontal: 20, paddingBottom: 94, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center" },
  brandMark: { width: 35, height: 35, borderRadius: 10, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  brandLetter: { fontWeight: "900", fontSize: 25, fontStyle: "italic", color: colors.primaryDark },
  brandDot: { color: colors.accent },
  brandWhite: { fontWeight: "900", fontSize: 18, color: colors.white, letterSpacing: 0.6 },
  brandGold: { fontWeight: "900", fontSize: 17, color: colors.accent, letterSpacing: 0.2 },
  actions: { flexDirection: "row", gap: 7 },
  topButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  welcome: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 29 },
  progressCircle: { width: 112, height: 112, borderRadius: 56, borderWidth: 3, borderColor: colors.accent, alignItems: "center", justifyContent: "center" },
  progressInner: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.09)" },
  progressText: { fontWeight: "800", color: colors.white, fontSize: 11, marginTop: 3 },
  welcomeCopy: { flex: 1, minWidth: 0 },
  hello: { color: colors.white, fontSize: 21, fontWeight: "900" },
  subtitle: { marginTop: 7, fontSize: 12, lineHeight: 18, color: "#CFD6E2" },
  achievement: { marginTop: 9, color: colors.accent, fontSize: 12, fontWeight: "800" },
});