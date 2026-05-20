import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function PrimaryButton({ title, loading = false, style, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, props.disabled && styles.disabled, style]}
      activeOpacity={0.85}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS['2xl'],
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: FONTS.black,
  },
});
