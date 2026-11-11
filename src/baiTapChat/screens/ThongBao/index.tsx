import React from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HangThongBao } from '../../components/HangThongBao';
import { TieuDeManHinh, TrangRong } from '../../components/common';
import type { ChatTabScreenProps } from '../../navigation/types';
import { useChat } from '../../state/ChatContext';
import { loiFirebase } from '../../../services/firebase';
import { styles } from './styles';

export const ThongBaoChat = ({
  navigation,
}: ChatTabScreenProps<'ThongBao'>) => {
  const { thongBao, docThongBao, docTatCaThongBao } = useChat();
  const count = thongBao.filter(item => !item.daDoc).length;
  const fail = (cause: unknown) => Alert.alert('Thông báo', loiFirebase(cause));
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={thongBao}
        keyExtractor={notice => notice.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <TieuDeManHinh title="Thông báo" />
            <View style={styles.actions}>
              <Text style={styles.summary} accessibilityLiveRegion="polite">
                {count ? `${count} thông báo chưa đọc` : 'Bạn đã đọc tất cả'}
              </Text>
              <TouchableOpacity
                disabled={!count}
                accessibilityState={{ disabled: !count }}
                onPress={() => docTatCaThongBao().catch(fail)}
                accessibilityRole="button"
                style={[styles.readAll, !count && styles.disabled]}
              >
                <Text style={styles.readAllText}>Đánh dấu tất cả đã đọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={<TrangRong title="Chưa có thông báo" icon="bell" />}
        renderItem={({ item }) => (
          <HangThongBao
            notice={item}
            onPress={() => {
              docThongBao(item.id).catch(fail);
              navigation.navigate('NoiDungChat', {
                troChuyenId: item.troChuyenId,
              });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};
