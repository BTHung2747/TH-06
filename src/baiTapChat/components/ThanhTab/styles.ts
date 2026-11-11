import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background, paddingTop: 8 },
  dock: {
    flexDirection: 'row',
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 28,
    gap: 2,
  },
  tab: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 24,
  },
  selected: { backgroundColor: theme.colors.soft },
  label: { fontSize: 11, color: theme.colors.secondary },
  selectedLabel: { color: theme.colors.primary, fontWeight: '600' },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '600' },
});
