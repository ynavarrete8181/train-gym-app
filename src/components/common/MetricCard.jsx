import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";

export default function MetricCard({ label, value, unit, change, status, icon, iconColor, bgColor }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 72,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon === "imc-text" ? (
            <Text style={{ fontSize: 9, fontWeight: "900", color: iconColor }}>IMC</Text>
          ) : (
            <MaterialCommunityIcons name={icon} size={12} color={iconColor} />
          )}
        </View>
        <Text numberOfLines={2} style={{ flex: 1, fontSize: 9, fontWeight: "800", color: colors.textSoft, lineHeight: 11 }}>
          {label}
        </Text>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {!!unit && <Text style={{ fontSize: 11, fontWeight: "800", color: colors.text }}> {unit}</Text>}
      </Text>
      
      {!!change && <Text style={{ marginTop: 4, fontSize: 11, fontWeight: "900", color: colors.success }}>{change}</Text>}
      {!!status && <Text style={{ marginTop: 4, fontSize: 11, fontWeight: "900", color: colors.success }}>{status}</Text>}
      
      <Text style={{ marginTop: 2, fontSize: 10, color: colors.textSoft, fontWeight: "600" }}>
        {status ? "Rango" : "vs. inicio"}
      </Text>
    </View>
  );
}
