import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatRoutes } from '../../navigation/types';
import { ONhap } from '../../components/ONhap';
import { useChat } from '../../state/ChatContext';
import { styles } from '../DangNhap/styles';
import { kiemTraDangKy } from '../../utils/dangKy';

export const DangKyChat = ({
  navigation,
}: NativeStackScreenProps<ChatRoutes, 'DangKy'>) => {
  const chat = useChat();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const submit = async () => {
    const message = kiemTraDangKy(name, email, password, confirm);
    setError(message);
    if (!message && !chat.loading) await chat.dangKy(name, email, password);
  };
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formWidth}>
            <Text style={styles.appName}>UDU CHAT</Text>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Kết nối và trò chuyện cùng bạn bè.
            </Text>
            <View style={styles.form}>
              <ONhap
                label="Họ tên"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                maxLength={80}
              />
              <ONhap
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              <ONhap
                label="Mật khẩu"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChangeText={setPassword}
                password
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <ONhap
                label="Nhập lại mật khẩu"
                value={confirm}
                onChangeText={setConfirm}
                password
                autoCapitalize="none"
                onSubmitEditing={submit}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.submit}
                onPress={submit}
                disabled={chat.loading}
                accessibilityRole="button"
                accessibilityLabel="Đăng ký"
              >
                <Text style={styles.submitText}>
                  {chat.loading ? 'Đang đăng ký…' : 'Đăng ký'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!(error || chat.error) && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error || chat.error}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.legacy}
              accessibilityRole="button"
              accessibilityLabel="Về đăng nhập"
              disabled={chat.loading}
            >
              <Text style={styles.legacyText}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
