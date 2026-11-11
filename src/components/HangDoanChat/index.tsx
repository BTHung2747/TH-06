import React from 'react';
import {View} from 'react-native';
import {AnhDaiDien} from '../AnhDaiDien';
import {ThongTinDoanChat} from '../ThongTinDoanChat';
import {styles} from './styles';

interface HangDoanChatProps {
  ten: string;
  tinNhan: string;
}

export const HangDoanChat = ({ten, tinNhan}: HangDoanChatProps) => {
  return (
    <View style={styles.hang}>
      <AnhDaiDien ten={ten} />
      <ThongTinDoanChat ten={ten} tinNhan={tinNhan} />
    </View>
  );
};

export default HangDoanChat;
