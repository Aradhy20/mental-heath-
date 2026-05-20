import { MD3LightTheme } from 'react-native-paper';

export const materialTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7E22CE', // M3 Primary (Violet)
    onPrimary: '#FFFFFF',
    primaryContainer: '#F3E8FF',
    onPrimaryContainer: '#2E004F',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#E6E1E5',
    outline: '#79747E',
  },
  roundness: 24,
};
