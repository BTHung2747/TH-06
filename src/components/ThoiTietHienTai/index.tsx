import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ThoiTietHienTaiProps {
  city?: string;
  temp?: string;
}

export const ThoiTietHienTai: React.FC<ThoiTietHienTaiProps> = ({
  city = 'Hà Nội',
  temp = '26°C',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.city}>{city}</Text>
      <Text style={styles.temp}>{temp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  city: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  temp: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default ThoiTietHienTai;
