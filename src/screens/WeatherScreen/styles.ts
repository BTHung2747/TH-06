import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  horizontalSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  horizontalScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  verticalSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  verticalScrollContent: {
    gap: 8,
    paddingBottom: 24,
  },
});

export default styles;
