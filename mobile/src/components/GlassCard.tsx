import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/tokens';

interface GlassCardProps extends ViewProps {
  children?: ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  return (
    <View style={[styles.glass, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['3xl'],
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
});
