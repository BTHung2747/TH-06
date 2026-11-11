import { StyleSheet } from 'react-native';
import { themeChat as theme } from '../../styles/theme';
export const styles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 14,
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 6,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.soft,
    borderBottomLeftRadius: 6,
  },
  text: { fontSize: 16, lineHeight: 24, color: theme.colors.text },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    color: theme.colors.primary,
  },
  outgoingText: { color: theme.colors.white },
  time: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    marginTop: 8,
    color: theme.colors.secondary,
  },
});
