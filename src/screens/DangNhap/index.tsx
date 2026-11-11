import React, {useState} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {icons} from '../../assets/icons/icons';
import type {DanhSachManHinh} from '../../commons/dieuHuong';
import {UduInput} from '../../components/ONhapUdu';
import {styles} from './styles';

type DangNhapProps = NativeStackScreenProps<DanhSachManHinh, 'DangNhap'>;

export const DangNhap: React.FC<DangNhapProps> = ({navigation}) => {
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');

  const dangNhap = () => {
    Keyboard.dismiss();
    navigation.replace('DoanChat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={icons.uduIcon}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Logo chat UDU"
              />
              <Text accessibilityRole="header" style={styles.title}>
                Đăng nhập
              </Text>
            </View>

            <View style={styles.form}>
              <UduInput
                label="Tài khoản"
                placeholder="Nhập tài khoản của bạn"
                value={taiKhoan}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                onChangeText={setTaiKhoan}
              />
              <UduInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={matKhau}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="done"
                onSubmitEditing={dangNhap}
                onChangeText={setMatKhau}
              />
              <Pressable
                accessibilityRole="button"
                onPress={dangNhap}
                style={({pressed}) => [
                  styles.loginButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DangNhap;
