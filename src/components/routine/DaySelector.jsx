import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { appStyles } from "../../theme/theme";

const DAYS = [
  { key: "lunes", label: "L" },
  { key: "martes", label: "M" },
  { key: "miercoles", label: "X" },
  { key: "jueves", label: "J" },
  { key: "viernes", label: "V" },
  { key: "sabado", label: "S" },
  { key: "domingo", label: "D" },
];

export default function DaySelector({ selectedDay, onSelectDay }) {
  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = selectedDay === day.key;
        return (
          <TouchableOpacity
            key={day.key}
            style={[appStyles.circleButton, isSelected && appStyles.circleButtonActive]}
            onPress={() => onSelectDay(day.key)}
          >
            <Text style={[appStyles.buttonText, { fontWeight: "700" }, isSelected && appStyles.buttonTextActive]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    paddingHorizontal: 4,
  },
});
