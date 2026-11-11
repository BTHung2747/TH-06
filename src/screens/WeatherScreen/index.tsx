import React from 'react';
import { View, ScrollView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThoiTietHienTai } from '../../components/ThoiTietHienTai';
import { ThoiTietTheoGio } from '../../components/ThoiTietTheoGio';
import { ThoiTietTheoNgay } from '../../components/ThoiTietTheoNgay';
import { styles } from './styles';

export const WeatherScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Quay lại trang chủ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <ThoiTietHienTai />
      </View>
      <View style={styles.horizontalSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          <ThoiTietTheoGio />
          <ThoiTietTheoGio />
          <ThoiTietTheoGio />
          <ThoiTietTheoGio />
          <ThoiTietTheoGio />
        </ScrollView>
      </View>
      <View style={styles.verticalSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalScrollContent}
        >
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
          <ThoiTietTheoNgay />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WeatherScreen;
