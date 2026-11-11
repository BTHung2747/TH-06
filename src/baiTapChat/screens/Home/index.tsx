import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ChatTabScreenProps } from '../../navigation/types';
import { HangTroChuyen } from '../../components/HangTroChuyen';
import { NguoiTrucTuyen } from '../../components/NguoiTrucTuyen';
import { ThanhTimKiem } from '../../components/ThanhTimKiem';
import { BieuTuong, TieuDeManHinh, TrangRong } from '../../components/common';
import { useChat } from '../../state/ChatContext';
import { khopTimKiem } from '../../utils/timKiem';
import { thoiGianTroChuyen } from '../../utils/thoiGian';
import { messagePreview } from '../../../services/chatModel';
import { themeChat as theme } from '../../styles/theme';
import { styles } from './styles';

export const HomeChat = ({ navigation }: ChatTabScreenProps<'Home'>) => {
  const chat = useChat();
  const [query, setQuery] = useState('');
  const items = chat.troChuyen.flatMap(item => {
    if (!item.user) return [];
    const last = item.last?.[1];
    const sender =
      last?.senderId === chat.taiKhoan?.id
        ? 'Bạn: '
        : item.user.laNhom && last
        ? `${
            chat.nguoiDung.find(person => person.id === last.senderId)
              ?.tenNgan || 'Thành viên'
          }: `
        : '';
    const message = last
      ? sender + messagePreview(last)
      : 'Bắt đầu cuộc trò chuyện';
    return khopTimKiem(item.user.ten + ' ' + message, query)
      ? [{ conversation: item, user: item.user, last, message }]
      : [];
  });

  const openDirect = async (nguoiDungId: string) => {
    Keyboard.dismiss();
    try {
      const troChuyenId = await chat.moChat(nguoiDungId);
      navigation.navigate('NoiDungChat', { troChuyenId, nguoiDungId });
    } catch {
      Alert.alert('Không mở được trò chuyện', 'Kiểm tra mạng và thử lại.');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={item => item.conversation.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {!!chat.error && (
              <Text accessibilityLiveRegion="polite">{chat.error}</Text>
            )}
            <TieuDeManHinh
              title="Cùng trò chuyện"
              onProfile={() => navigation.navigate('CaiDat')}
            />
            <ThanhTimKiem
              value={query}
              onChange={setQuery}
              placeholder="Tìm kiếm cuộc trò chuyện"
            />
            <TouchableOpacity
              style={groupStyle.button}
              accessibilityRole="button"
              onPress={() => navigation.navigate('TaoNhom')}
            >
              <BieuTuong name="users" size={20} color={theme.colors.primary} />
              <Text style={groupStyle.label}>Tạo nhóm</Text>
            </TouchableOpacity>
            {!query.trim() && (
              <NguoiTrucTuyen
                users={chat.nguoiDung.filter(user => user.online)}
                onPress={user => openDirect(user.id)}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          <TrangRong
            title={
              query.trim()
                ? 'Không tìm thấy cuộc trò chuyện'
                : 'Chưa có cuộc trò chuyện'
            }
            subtitle={
              query.trim()
                ? undefined
                : 'Chọn một người trong Danh bạ hoặc tạo nhóm mới.'
            }
          />
        }
        renderItem={({ item }) => (
          <HangTroChuyen
            user={item.user}
            chat={item.conversation}
            message={item.message}
            time={item.last ? thoiGianTroChuyen(item.last.createdAt) : 'Mới'}
            onPress={() => {
              Keyboard.dismiss();
              if (chat.chatRows[item.conversation.id]?.legacyPeer) {
                openDirect(item.user.id);
              } else {
                navigation.navigate('NoiDungChat', {
                  troChuyenId: item.conversation.id,
                });
              }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const groupStyle = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.soft,
  },
  label: { fontWeight: '600', color: theme.colors.primary },
});
