import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NguoiDung, TroChuyen } from '../../types';
import { AnhDaiDien } from '../AnhDaiDien';
import { styles } from './styles';
export const HangTroChuyen = ({
  user,
  chat,
  message,
  time,
  onPress,
}: {
  user: NguoiDung;
  chat: TroChuyen;
  message: string;
  time: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.65}
    onPress={onPress}
    style={[styles.row, chat.soChuaDoc > 0 && styles.unread]}
    accessibilityRole="button"
    accessibilityLabel={`${user.ten}, ${message}, ${time}${
      chat.soChuaDoc ? `, ${chat.soChuaDoc} tin chưa đọc` : ''
    }`}
  >
    <AnhDaiDien
      source={user.avatar}
      online={user.online}
      muted={!chat.soChuaDoc}
    />
    <View style={styles.copy}>
      <View style={styles.top}>
        <Text style={styles.name}>{user.ten}</Text>
        <Text style={[styles.time, !!chat.soChuaDoc && styles.unreadTime]}>
          {time}
        </Text>
      </View>
      <View style={styles.bottom}>
        <Text
          numberOfLines={2}
          style={[styles.message, !!chat.soChuaDoc && styles.unreadMessage]}
        >
          {message}
        </Text>
        {chat.soChuaDoc > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {chat.soChuaDoc > 99 ? '99+' : chat.soChuaDoc}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);
