import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unread: {
    backgroundColor: theme.colors.soft,
    borderColor: theme.colors.soft,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.secondary,
    marginVertical: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  time: { fontSize: 12, color: theme.colors.secondary },
  status: { fontSize: 12, color: theme.colors.secondary },
  unreadStatus: { color: theme.colors.primary, fontWeight: '600' },
});
