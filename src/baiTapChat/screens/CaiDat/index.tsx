import React from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnhDaiDien } from '../../components/AnhDaiDien';
import { BieuTuong, TieuDeManHinh } from '../../components/common';
import { useChat } from '../../state/ChatContext';
import { themeChat as theme } from '../../styles/theme';
import { pickChatPhoto, uploadChatPhoto } from '../../../services/uploadService';
import { styles } from './styles';

export const CaiDatChat = () => {
  const chat = useChat();
  const account = chat.taiKhoan;
  const [name, setName] = useState(account?.tenHienThi || '');
  if (!account) return null;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TieuDeManHinh
          title="Cài đặt"
          subtitle="Tài khoản và trạng thái của bạn"
        />
        {!!chat.error && (
          <Text style={styles.description} accessibilityLiveRegion="polite">
            {chat.error}
          </Text>
        )}
        <View style={styles.profile}>
          <AnhDaiDien
            source={account.avatar}
            size={88}
            online={chat.hienThiOnline}
          />
          <Text style={styles.name}>{account.tenHienThi}</Text>
          <Text style={styles.username}>@{account.taiKhoan}</Text>
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Hồ sơ cá nhân</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Họ tên" maxLength={80} style={styles.description} accessibilityLabel="Họ tên hiển thị" />
          <TouchableOpacity style={styles.row} onPress={async () => {
            try {
              const image = await pickChatPhoto('library');
              if (image) await chat.capNhatHoSoNguoiDung(name || account.tenHienThi, await uploadChatPhoto(image));
            } catch (e) { Alert.alert('Cập nhật ảnh đại diện', e instanceof Error ? e.message : 'Không thể cập nhật ảnh.'); }
          }}><Text style={styles.label}>Chọn ảnh đại diện</Text></TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => chat.capNhatHoSoNguoiDung(name).then(() => Alert.alert('Hồ sơ', 'Đã cập nhật họ tên.')).catch(e => Alert.alert('Hồ sơ', e.message))}><Text style={styles.label}>Lưu hồ sơ</Text></TouchableOpacity>
        </View>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label}>Tài khoản</Text>
              <Text style={styles.description}>{account.taiKhoan}</Text>
            </View>
            <BieuTuong name="user" />
          </View>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label}>Trạng thái trực tuyến</Text>
              <Text style={styles.description}>
                {chat.hienThiOnline
                  ? 'Bạn đang hiển thị trực tuyến'
                  : 'Bạn đang hiển thị ngoại tuyến'}
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={chat.hienThiOnline}
              onValueChange={chat.doiOnline}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
              ios_backgroundColor={theme.colors.border}
              accessibilityLabel="Hiển thị trạng thái trực tuyến"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label}>Hiển thị số chưa đọc</Text>
              <Text style={styles.description}>
                Tin nhắn và thông báo trên thanh tab
              </Text>
            </View>
            <Switch
              style={styles.switch}
              value={chat.hienThiBadge}
              onValueChange={chat.doiBadge}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
              ios_backgroundColor={theme.colors.border}
              accessibilityLabel="Hiển thị số chưa đọc trên thanh tab"
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={chat.dangXuat}
          activeOpacity={0.65}
          style={styles.logout}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
        >
          <BieuTuong name="logout" color={theme.colors.primary} size={22} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        {!!chat.moDuAnCu && (
          <TouchableOpacity
            onPress={chat.moDuAnCu}
            activeOpacity={0.65}
            accessibilityRole="button"
            style={styles.legacy}
          >
            <Text style={styles.legacyText}>Mở dự án ban đầu</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
