import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  copy: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  status: { fontSize: 13, color: theme.colors.secondary, marginTop: 5 },
  online: { color: theme.colors.primary },
});
