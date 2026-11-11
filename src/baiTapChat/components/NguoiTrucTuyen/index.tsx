import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import type { NguoiDung } from '../../types';
import { AnhDaiDien } from '../AnhDaiDien';
import { styles } from './styles';
export const NguoiTrucTuyen = ({
  users,
  onPress,
}: {
  users: NguoiDung[];
  onPress: (user: NguoiDung) => void;
}) => (
  <FlatList
    horizontal
    data={users}
    keyExtractor={user => user.id}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.list}
    keyboardShouldPersistTaps="handled"
    renderItem={({ item }) => (
      <TouchableOpacity
        activeOpacity={0.65}
        onPress={() => onPress(item)}
        style={styles.person}
        accessibilityRole="button"
        accessibilityLabel={`${item.ten}, đang trực tuyến, mở trò chuyện`}
      >
        <AnhDaiDien source={item.avatar} size={48} online />
        <Text style={styles.name}>{item.tenNgan}</Text>
      </TouchableOpacity>
    )}
  />
);
