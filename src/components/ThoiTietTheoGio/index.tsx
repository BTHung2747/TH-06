import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ThoiTietTheoGioProps {
  time?: string;
  status?: string;
  temp?: string;
}

export const ThoiTietTheoGio: React.FC<ThoiTietTheoGioProps> = ({
  time = '11 giờ',
  status = 'Mưa',
  temp = '26°C',
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.timeText}>{time}</Text>
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.tempText}>{temp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 68,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  tempText: {
    fontSize: 12,
    color: '#334155',
  },
});

export default ThoiTietTheoGio;
