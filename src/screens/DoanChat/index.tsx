import React from 'react';
import {Image, ScrollView, StatusBar, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {icons} from '../../assets/icons/icons';
import {HangDoanChat} from '../../components/HangDoanChat';
import {styles} from './styles';

const danhSachChat = [
  {id: '1', ten: 'An', tinNhan: 'Chào bạn!'},
  {id: '2', ten: 'Bình', tinNhan: 'Chiều nay đi học nhé.'},
  {id: '3', ten: 'Nhóm lớp', tinNhan: 'Mai nộp bài tập nha.'},
  {id: '4', ten: 'Bạn bè', tinNhan: 'Cuối tuần đi chơi không?'},
];

export const DoanChat = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.dauTrang}>
        <Image
          source={icons.tinNhanIcon}
          style={styles.bieuTuongTinNhan}
          resizeMode="contain"
          accessible={false}
        />
        <Text accessibilityRole="header" style={styles.tieuDe}>
          Đoạn chat
        </Text>
      </View>

      <ScrollView>
        {danhSachChat.map(chat => (
          <HangDoanChat key={chat.id} ten={chat.ten} tinNhan={chat.tinNhan} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoanChat;
