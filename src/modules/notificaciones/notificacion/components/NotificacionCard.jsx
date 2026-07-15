import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppCard from "../../../../components/common/AppCard";
import { colors } from "../../../../theme/colors";
import { typography } from "../../../../theme/typography";

export default function NotificacionCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      <AppCard style={[styles.card, !item.leida && styles.cardUnread]}>
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, item.leida && styles.iconBoxRead]}>
            <MaterialCommunityIcons
              name={getNotificationIcon(item.tipo)}
              size={22}
              color={item.leida ? colors.textSoft : colors.surface}
            />
          </View>
          <View style={styles.cardCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.titulo}</Text>
              {!item.leida ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.message}>{item.mensaje}</Text>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

function getNotificationIcon(type = "") {
  const value = String(type).toUpperCase();
  if (value.includes("CUMPLE")) return "cake-variant-outline";
  if (value.includes("PAGO") || value.includes("FACTURA")) return "receipt-text-outline";
  if (value.includes("RUTINA") || value.includes("PLAN")) return "dumbbell";
  return "bell-outline";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  cardUnread: {
    borderColor: "rgba(242, 177, 0, 0.45)",
    backgroundColor: "#FFFBEF",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  iconBoxRead: {
    backgroundColor: colors.surfaceAlt,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...typography.itemTitle,
    flex: 1,
    fontSize: 15,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  message: {
    ...typography.itemSubtitle,
    marginTop: 4,
    lineHeight: 18,
  },
  date: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "800",
  },
});
