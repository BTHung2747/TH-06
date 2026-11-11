import {StyleSheet} from 'react-native';
import {theme} from '../../styles/theme';

export const styles = StyleSheet.create({
  noiDung: {
    flex: 1,
    gap: 4,
  },
  ten: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tinNhan: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
