import {StyleSheet} from 'react-native';
import {theme} from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  dauTrang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
  },
  bieuTuongTinNhan: {
    width: 32,
    height: 32,
  },
  tieuDe: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
