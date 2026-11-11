import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ThoiTietTheoNgayProps {
  time?: string;
  status?: string;
  temp?: string;
}

export const ThoiTietTheoNgay: React.FC<ThoiTietTheoNgayProps> = ({
  time = '11 giờ',
  status = 'Mưa',
  temp = '26°C',
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.timeText}>{time}</Text>
      <View style={styles.rightGroup}>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.tempText}>{temp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 14,
    color: '#334155',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  tempText: {
    fontSize: 14,
    color: '#334155',
  },
});

export default ThoiTietTheoNgay;
