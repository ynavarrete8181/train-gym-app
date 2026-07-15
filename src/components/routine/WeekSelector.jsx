import { View, StyleSheet } from "react-native";
import AppSegmentedSelector from "../common/AppSegmentedSelector";

export default function WeekSelector({ totalWeeks = 4, selectedWeek, onSelectWeek }) {
  const weeks = Array.from({ length: Math.max(1, totalWeeks) }, (_, index) => index + 1);
  const options = weeks.map((week) => ({ value: week, label: `Semana ${week}` }));

  return (
    <View style={styles.container}>
      <AppSegmentedSelector options={options} value={selectedWeek} onChange={onSelectWeek} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
});
