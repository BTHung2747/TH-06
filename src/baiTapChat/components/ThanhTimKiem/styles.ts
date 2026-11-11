import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 22,
    backgroundColor: theme.colors.muted,
    marginHorizontal: 24,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
