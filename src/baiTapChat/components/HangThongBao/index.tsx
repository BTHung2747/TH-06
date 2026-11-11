import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { ThongBao } from '../../types';
import { BieuTuong } from '../common';
import { themeChat as theme } from '../../styles/theme';
import { styles } from './styles';
export const HangThongBao = ({
  notice,
  onPress,
}: {
  notice: ThongBao;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.65}
    onPress={onPress}
    style={[styles.row, !notice.daDoc && styles.unread]}
    accessibilityRole="button"
    accessibilityLabel={`${notice.tieuDe}. ${notice.noiDung}. ${
      notice.thoiGian
    }. ${notice.daDoc ? 'Đã đọc' : 'Chưa đọc, nhấn để đánh dấu đã đọc'}`}
  >
    <View style={styles.icon}>
      <BieuTuong
        name={
          notice.loai === 'nhom'
            ? 'users'
            : notice.loai === 'tinNhan'
            ? 'message'
            : 'bell'
        }
        color={notice.daDoc ? theme.colors.secondary : theme.colors.primary}
      />
    </View>
    <View style={styles.copy}>
      <Text style={styles.title}>{notice.tieuDe}</Text>
      <Text style={styles.description}>{notice.noiDung}</Text>
      <View style={styles.meta}>
        <Text style={styles.time}>{notice.thoiGian}</Text>
        <Text style={[styles.status, !notice.daDoc && styles.unreadStatus]}>
          {notice.daDoc ? 'Đã đọc' : 'Chưa đọc'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);
