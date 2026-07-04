import { View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function SeriesRow({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(17,24,39,0.06)",
      }}
    >
      <Text style={{ color: colors.textSoft }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}
