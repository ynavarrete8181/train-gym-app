import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function AppSegmentedSelector({
  options = [],
  value,
  onChange,
  horizontal = true,
  columns = 3,
  disabled = false,
  compact = false,
}) {
  if (!Array.isArray(options) || options.length === 0) return null;

  const content = (
    <View style={[styles.wrap, !horizontal && styles.grid]}>
      {options.map((option) => {
        const optionValue = option.value ?? option.id;
        const isActive = value === optionValue;
        return (
          <TouchableOpacity
            key={String(optionValue)}
            disabled={disabled || option.disabled}
            activeOpacity={0.82}
            onPress={() => onChange?.(optionValue, option)}
            style={[
              styles.item,
              compact && styles.itemCompact,
              !horizontal && { flexBasis: getBasis(columns) },
              isActive && styles.itemActive,
              (disabled || option.disabled) && !isActive && styles.itemDisabled,
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.label, compact && styles.labelCompact, isActive && styles.labelActive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!horizontal) {
    return content;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {content}
    </ScrollView>
  );
}

function getBasis(columns) {
  const safeColumns = Math.max(1, Number(columns) || 3);
  if (safeColumns <= 2) return "48.5%";
  if (safeColumns === 3) return "31.7%";
  return "23.5%";
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 4,
  },
  wrap: {
    flexDirection: "row",
    gap: 8,
  },
  grid: {
    flexWrap: "wrap",
  },
  item: {
    minWidth: 88,
    minHeight: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemCompact: {
    minWidth: 76,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  itemDisabled: {
    opacity: 0.58,
  },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  labelCompact: {
    fontSize: 11,
  },
  labelActive: {
    color: colors.text,
  },
});
