import React from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.kk}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Bùi Tuấn Hưng</Text>
            <Text style={styles.userCode}>B23DCC079</Text>
            <Text style={styles.userMajor}>Công nghệ thông tin</Text>
          </View>
        </View>
      </View>
      <View style={styles.gpa}>
        <Text style={styles.itemText}>Thông tin GPA: 3.6 / 4.0</Text>
        <Text style={styles.itemText}>Số tín chỉ đã học : 85/120</Text>
        <Text style={styles.itemText}>Môn học đang nợ : 0 môn học</Text>
      </View>
      <View style={styles.mon}>
        <Text style={styles.itemText}>Thông tin GPA: 3.6 / 4.0</Text>

        <TouchableOpacity
          style={styles.btnWeather}
          onPress={() => navigation.navigate('Weather')}
        >
          <Text style={styles.btnWeatherText}>🌤 Xem Dự Báo Thời Tiết →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
