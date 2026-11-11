import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c3c0c0ff',
    padding: 16,
    gap: 16,
  },
  headerContainer: {
    width: '100%',
  },
  kk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  userInfo: {
    justifyContent: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  userCode: {
    fontSize: 16,
    color: '#64748B',
  },
  userMajor: {
    fontSize: 16,
    color: '#64748B',
  },
  gpa: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center', // Căn các dòng chữ nằm ở giữa khung
    gap: 12,                  // Tách đều khoảng cách giữa 3 dòng chữ
  },
  mon: {
    flex: 3,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  btnWeather: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnWeatherText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
