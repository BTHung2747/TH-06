import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

interface ThongTinDoanChatProps {
  ten: string;
  tinNhan: string;
}

export const ThongTinDoanChat = ({ten, tinNhan}: ThongTinDoanChatProps) => {
  return (
    <View style={styles.noiDung}>
      <Text style={styles.ten}>{ten}</Text>
      <Text style={styles.tinNhan}>{tinNhan}</Text>
    </View>
  );
};

export default ThongTinDoanChat;
