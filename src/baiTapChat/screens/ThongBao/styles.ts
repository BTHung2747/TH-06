import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingBottom: 12, flexGrow: 1 },
  actions: {
    paddingHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  summary: { fontSize: 13, color: theme.colors.secondary },
  readAll: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  readAllText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  disabled: { opacity: 0.4 },
});
