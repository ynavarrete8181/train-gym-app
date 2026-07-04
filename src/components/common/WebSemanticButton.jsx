import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function WebSemanticButton({
  label,
  icon,
  tone = 'neutral',
  onPress,
  style,
  borderWidth = 1.5,
  size = 'medium',
}) {
  const getToneColors = () => {
    switch (tone) {
      case 'primary':
      case 'mustard':
        return {
          border: colors.primary,
          bg: '#ffffff',
          iconBg: colors.primary,
          iconColor: '#ffffff',
          text: '#111827',
        };
      case 'danger':
      case 'error':
        return {
          border: '#EF4444',
          bg: '#ffffff',
          iconBg: '#EF4444',
          iconColor: '#ffffff',
          text: '#EF4444',
        };
      case 'success':
        return {
          border: '#10B981',
          bg: '#ffffff',
          iconBg: '#10B981',
          iconColor: '#ffffff',
          text: '#10B981',
        };
      default:
        return {
          border: 'rgba(17, 24, 39, 0.12)',
          bg: '#ffffff',
          iconBg: '#0f172a',
          iconColor: '#ffffff',
          text: '#0f172a',
        };
    }
  };

  const t = getToneColors();

  const isSmall = size === 'small';

  const ButtonWrapper = onPress ? TouchableOpacity : View;

  return (
    <ButtonWrapper
      style={[
        styles.button,
        isSmall && styles.buttonSmall,
        { borderColor: t.border, backgroundColor: t.bg, borderWidth },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <View style={[styles.iconBox, isSmall && styles.iconBoxSmall, { backgroundColor: t.iconBg }, !label && { marginRight: 0 }]}>
          <MaterialCommunityIcons name={icon} size={isSmall ? 10 : 14} color={t.iconColor} />
        </View>
      )}
      {label ? <Text style={[styles.text, isSmall && styles.textSmall, { color: t.text }]}>{label}</Text> : null}
    </ButtonWrapper>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  iconBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconBoxSmall: {
    width: 14,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
  },
  text: {
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 10,
  },
});
