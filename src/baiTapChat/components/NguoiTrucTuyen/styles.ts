import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, gap: 20, paddingBottom: 20 },
  person: { minWidth: 48, alignItems: 'center', gap: 6 },
  name: { fontSize: 12, color: theme.colors.secondary },
});
