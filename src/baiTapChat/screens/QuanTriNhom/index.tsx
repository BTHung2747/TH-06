import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loiFirebase } from '../../../services/firebase';
import { leaveGroup, renameGroup, updateGroupMembers } from '../../../services/groupService';
import { watchConversation } from '../../../services/chatService';
import type { Conversation } from '../../../services/chatModel';
import type { ChatRoutes } from '../../navigation/types';
import { useChat } from '../../state/ChatContext';
import { themeChat as theme } from '../../styles/theme';

export const QuanTriNhom = ({ navigation, route }: NativeStackScreenProps<ChatRoutes, 'QuanTriNhom'>) => {
  const { taiKhoan, nguoiDung } = useChat();
  const [room, setRoom] = useState<Conversation | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const uid = taiKhoan?.id || '';
  useEffect(() => watchConversation(route.params.troChuyenId, value => { setRoom(value); setName(value?.name || ''); }, e => Alert.alert('Nhóm', loiFirebase(e))), [route.params.troChuyenId]);
  const perform = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e) { Alert.alert('Quản trị nhóm', loiFirebase(e)); } finally { setBusy(false); } };
  const members = Object.keys(room?.members || {});
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary, paddingVertical: 12 }}>‹ Quay lại</Text></TouchableOpacity>
    <Text accessibilityRole="header" style={{ color: theme.colors.text, fontWeight: '700', fontSize: 22, marginBottom: 16 }}>Quản trị nhóm</Text>
    <TextInput value={name} onChangeText={setName} maxLength={80} placeholder="Tên nhóm" style={{ padding: 12, color: theme.colors.text, borderBottomWidth: 1, borderColor: theme.colors.border }} />
    <TouchableOpacity disabled={busy} onPress={() => perform(() => renameGroup(route.params.troChuyenId, name))} style={{ padding: 14 }}><Text style={{ color: theme.colors.primary }}>Lưu tên nhóm</Text></TouchableOpacity>
    <Text style={{ color: theme.colors.text, fontWeight: '600', paddingVertical: 10 }}>Thành viên · {members.length}</Text>
    <FlatList data={nguoiDung.filter(p => members.includes(p.id) || !members.includes(p.id))} keyExtractor={p => p.id} renderItem={({ item }) => {
      const isMember = !!room?.members[item.id];
      return <TouchableOpacity disabled={busy || item.id === uid} onPress={() => perform(() => updateGroupMembers(route.params.troChuyenId, uid, isMember ? { remove: [item.id] } : { add: [item.id] }))} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: theme.colors.text }}>{isMember ? '✓ ' : '+ '}{item.ten}{item.id === uid ? ' (bạn)' : ''}</Text></TouchableOpacity>;
    }} />
    <TouchableOpacity disabled={busy} onPress={() => Alert.alert('Rời nhóm?', 'Thành viên khác sẽ thấy thông báo bạn đã rời nhóm.', [{ text: 'Hủy', style: 'cancel' }, { text: 'Rời nhóm', style: 'destructive', onPress: () => perform(() => leaveGroup(route.params.troChuyenId, uid, taiKhoan?.tenHienThi || 'Một thành viên').then(() => navigation.popToTop())) }])} style={{ padding: 16, marginTop: 12 }}><Text style={{ color: '#b42318', fontWeight: '600' }}>Rời nhóm</Text></TouchableOpacity>
  </SafeAreaView>;
};
