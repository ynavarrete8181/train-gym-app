import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { appStyles } from "../../theme/theme";

export default function WeekSelector({ weeks = [1, 2, 3, 4], selectedWeek, onSelectWeek }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {weeks.map((week) => {
          const isSelected = selectedWeek === week;
          return (
            <TouchableOpacity
              key={week}
              style={[appStyles.pillButton, isSelected && appStyles.pillButtonActive]}
              onPress={() => onSelectWeek(week)}
            >
              <Text style={[appStyles.buttonText, isSelected && appStyles.buttonTextActive]}>
                Semana {week}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    gap: 8,
  },
});
