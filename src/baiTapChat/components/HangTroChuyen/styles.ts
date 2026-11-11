import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 88,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  unread: {
    backgroundColor: theme.colors.soft,
    borderColor: theme.colors.soft,
  },
  copy: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.text },
  time: { fontSize: 12, color: theme.colors.secondary },
  unreadTime: { color: theme.colors.primary },
  bottom: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.secondary,
  },
  unreadMessage: { fontWeight: '500', color: theme.colors.text },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 12, color: theme.colors.white, fontWeight: '500' },
});
