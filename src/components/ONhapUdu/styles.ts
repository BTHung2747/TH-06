import {StyleSheet} from 'react-native';
import {theme} from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  focused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: theme.colors.surface,
  },
  invalid: {
    borderColor: theme.colors.error,
  },
  disabled: {
    opacity: 0.55,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
});
