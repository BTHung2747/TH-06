import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NguoiDung } from '../../types';
import { AnhDaiDien } from '../AnhDaiDien';
import { BieuTuong } from '../common';
import { styles } from './styles';
export const HangDanhBa = ({
  user,
  onPress,
}: {
  user: NguoiDung;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.65}
    style={styles.row}
    accessibilityRole="button"
    accessibilityLabel={`${user.ten}, ${
      user.online ? 'đang trực tuyến' : 'ngoại tuyến'
    }, mở trò chuyện`}
  >
    <AnhDaiDien
      source={user.avatar}
      online={user.online}
      muted={!user.online}
    />
    <View style={styles.copy}>
      <Text style={styles.name}>{user.ten}</Text>
      <Text style={[styles.status, user.online && styles.online]}>
        {user.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
      </Text>
    </View>
    <BieuTuong name="next" size={20} />
  </TouchableOpacity>
);
