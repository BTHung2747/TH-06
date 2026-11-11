import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    minHeight: 54,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  focused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  invalid: { borderColor: theme.colors.error },
  eyeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { fontSize: 13, color: theme.colors.error, lineHeight: 20 },
});
