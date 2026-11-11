import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

interface AnhDaiDienProps {
  ten: string;
}

export const AnhDaiDien = ({ten}: AnhDaiDienProps) => {
  return (
    <View style={styles.khungTron}>
      <Text style={styles.chuDaiDien}>{ten.charAt(0)}</Text>
    </View>
  );
};

export default AnhDaiDien;
