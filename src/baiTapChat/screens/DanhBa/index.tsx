import React, { useState } from 'react';
import { Alert, FlatList, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ChatTabScreenProps } from '../../navigation/types';
import { HangDanhBa } from '../../components/HangDanhBa';
import { ThanhTimKiem } from '../../components/ThanhTimKiem';
import { TieuDeManHinh, TrangRong } from '../../components/common';
import { useChat } from '../../state/ChatContext';
import { khopTimKiem } from '../../utils/timKiem';
import { styles } from './styles';

export const DanhBaChat = ({ navigation }: ChatTabScreenProps<'DanhBa'>) => {
  const chat = useChat();
  const [query, setQuery] = useState('');
  const users = chat.nguoiDung.filter(user => !user.laNhom);
  const filtered = users.filter(user => khopTimKiem(user.ten, query));
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={filtered}
        keyExtractor={user => user.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <TieuDeManHinh
              title="Danh bạ"
              subtitle={`${users.length} người bạn · ${
                users.filter(user => user.online).length
              } đang trực tuyến`}
              onProfile={() => navigation.navigate('CaiDat')}
            />
            <ThanhTimKiem
              value={query}
              onChange={setQuery}
              placeholder="Tìm kiếm danh bạ"
            />
          </View>
        }
        ListEmptyComponent={
          <TrangRong
            title="Không tìm thấy người dùng"
            subtitle="Thử tìm bằng tên khác nhé."
            icon="users"
          />
        }
        renderItem={({ item }) => (
          <HangDanhBa
            user={item}
            onPress={async () => {
              Keyboard.dismiss();
              try {
                navigation.navigate('NoiDungChat', {
                  troChuyenId: await chat.moChat(item.id),
                  nguoiDungId: item.id,
                });
              } catch {
                Alert.alert(
                  'Không mở được trò chuyện',
                  'Kiểm tra mạng và thử lại.',
                );
              }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};
