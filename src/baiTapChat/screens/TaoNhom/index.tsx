import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createGroup } from '../../../services/groupService';
import { loiFirebase } from '../../../services/firebase';
import { AnhDaiDien } from '../../components/AnhDaiDien';
import { BieuTuong, TrangRong } from '../../components/common';
import type { ChatRoutes } from '../../navigation/types';
import { useChat } from '../../state/ChatContext';
import { themeChat as theme } from '../../styles/theme';

export const TaoNhom = ({
  navigation,
}: NativeStackScreenProps<ChatRoutes, 'TaoNhom'>) => {
  const { taiKhoan, nguoiDung } = useChat();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const disabled = saving || !name.trim() || selected.length < 2;

  const save = async () => {
    if (!taiKhoan?.id || disabled) return;
    setSaving(true);
    try {
      const troChuyenId = await createGroup(taiKhoan.id, name, selected);
      navigation.replace('NoiDungChat', { troChuyenId });
    } catch (cause) {
      Alert.alert('Không tạo được nhóm', loiFirebase(cause));
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={styles.back}
        >
          <BieuTuong name="back" color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} accessibilityRole="header">
          Tạo nhóm
        </Text>
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={80}
        placeholder="Tên nhóm"
        accessibilityLabel="Tên nhóm"
        placeholderTextColor={theme.colors.secondary}
        style={styles.input}
      />
      <Text style={styles.hint}>
        Chọn ít nhất 2 người từ Danh bạ · Đã chọn {selected.length}
      </Text>
      <FlatList
        data={nguoiDung}
        keyExtractor={person => person.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <TrangRong title="Danh bạ chưa có thành viên" icon="users" />
        }
        renderItem={({ item }) => {
          const checked = selected.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() =>
                setSelected(current =>
                  checked
                    ? current.filter(id => id !== item.id)
                    : [...current, item.id],
                )
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={styles.row}
            >
              <AnhDaiDien source={item.avatar} size={40} online={item.online} />
              <Text style={styles.name}>{item.ten}</Text>
              <View style={[styles.checkbox, checked && styles.checked]}>
                {checked && (
                  <BieuTuong
                    name="check"
                    size={16}
                    color={theme.colors.white}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity
        style={[styles.submit, disabled && styles.disabled]}
        disabled={disabled}
        onPress={save}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {saving ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.submitText}>Tạo nhóm</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  back: { padding: 10 },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.text,
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    fontSize: 16,
  },
  hint: {
    color: theme.colors.secondary,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  name: { color: theme.colors.text, fontSize: 16, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  submit: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  disabled: { opacity: 0.45 },
  submitText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
});
