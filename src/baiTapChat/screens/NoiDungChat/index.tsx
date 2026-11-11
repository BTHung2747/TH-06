import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Asset } from 'react-native-image-picker';
import type { ChatRoutes } from '../../navigation/types';
import { AnhDaiDien } from '../../components/AnhDaiDien';
import { BongBongTinNhan } from '../../components/BongBongTinNhan';
import { BieuTuong, TrangRong } from '../../components/common';
import { avatars } from '../../assets/avatars';
import { useChat } from '../../state/ChatContext';
import { themeChat as theme } from '../../styles/theme';
import { dinhDangGio, dinhDangNgay } from '../../utils/thoiGian';
import { useChatMessages } from './useChatMessages';
import { styles } from './styles';
import { loiFirebase } from '../../../services/firebase';
import {
  startChatActivity,
  watchTyping,
  type TypingState,
} from '../../../services/chatActivityService';
import {
  danhDauDaDoc,
  guiTinFirebase,
  reactToMessage,
  recallMessage,
  watchConversation,
  watchReceipt,
} from '../../../services/chatService';
import { layViTriHienTai } from '../../../services/locationService';
import {
  pickChatPhoto,
  uploadChatPhoto,
} from '../../../services/uploadService';
import {
  mapUrl,
  messagePreview,
  reactions,
  type Conversation,
  type MessageEntry,
  type ReadReceipt,
} from '../../../services/chatModel';

interface PendingPhoto {
  asset: Asset;
  url?: string;
  error?: string;
}

const fail = (cause: unknown) =>
  Alert.alert('Cuộc trò chuyện', loiFirebase(cause));

export const NoiDungChat = ({
  navigation,
  route,
}: NativeStackScreenProps<ChatRoutes, 'NoiDungChat'>) => (
  <ConversationScreen
    key={route.params.troChuyenId}
    navigation={navigation}
    route={route}
  />
);

export default NoiDungChat;

const ConversationScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<ChatRoutes, 'NoiDungChat'>) => {
  const chat = useChat();
  const id = route.params.troChuyenId;
  const uid = chat.taiKhoan?.id;
  const focused = useIsFocused();
  const active = focused && chat.foreground;
  const [room, setRoom] = useState<Conversation | null | undefined>();
  const [roomError, setRoomError] = useState('');
  const { messages, older, loading, loadingOlder, error, loadMore, retry } =
    useChatMessages(id);
  const [typing, setTyping] = useState<TypingState>({});
  const [receipts, setReceipts] = useState<Record<string, ReadReceipt>>({});
  const [now, setNow] = useState(Date.now);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<PendingPhoto>();
  const [picking, setPicking] = useState(false);
  const [viewer, setViewer] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const activity = useRef<ReturnType<typeof startChatActivity> | undefined>(
    undefined,
  );
  const readRequest = useRef<string | undefined>(undefined);
  const listRef = useRef<FlatList<MessageEntry>>(null);
  const canWrite = !!room && !!uid && room.members[uid] === true;

  useEffect(
    () =>
      watchConversation(id, setRoom, cause => setRoomError(loiFirebase(cause))),
    [id],
  );
  useEffect(() => {
    const stops = [
      watchTyping(id, setTyping, fail),
      watchReceipt(id, setReceipts, fail),
    ];
    return () => stops.forEach(stop => stop());
  }, [id]);

  useEffect(() => {
    if (!active || !uid || !canWrite) return;
    const session = startChatActivity(id, uid, fail);
    activity.current = session;
    return () => {
      activity.current = undefined;
      session.close();
    };
  }, [id, uid, active, canWrite]);

  useEffect(() => {
    if (!focused) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [focused]);

  const summary = chat.chatRows[id]?.summary;
  const latest = messages[0];
  const receipt = uid ? receipts[uid] : undefined;
  useEffect(() => {
    if (!active || !uid || !latest || !canWrite) return;
    const [key, last] = latest;
    const unread = summary?.unread || 0;
    if (summary?.lastMessage && summary.lastMessage !== key) return;
    if (receipt?.messageId === key && !unread) return;
    if (
      receipt &&
      (receipt.messageAt > last.createdAt ||
        (receipt.messageAt === last.createdAt && receipt.messageId > key))
    )
      return;
    const request = `${key}:${unread > 0}`;
    if (readRequest.current === request) return;
    readRequest.current = request;
    danhDauDaDoc(id, uid, latest, unread > 0).catch(() => {
      // An incoming send can advance the summary before this write reaches the server.
      if (readRequest.current === request) readRequest.current = undefined;
    });
  }, [active, canWrite, id, latest, receipt, summary, uid]);

  const sendText = async () => {
    if (!room || !uid || sending || !text.trim()) return;
    const draft = text;
    setSending(true);
    activity.current?.clearTyping();
    try {
      const replied = messages.find(([key]) => key === replyToId)?.[1];
      await guiTinFirebase(id, uid, room, {
        type: 'text',
        text: draft.trim(),
        ...(replyToId && replied ? { replyTo: {
          messageId: replyToId,
          senderId: replied.senderId,
          text: replied.text || messagePreview(replied),
        } } : {}),
      });
      setReplyToId(undefined);
      setText(current => (current === draft ? '' : current));
      listRef.current?.scrollToOffset({ offset: 0 });
    } catch (cause) {
      fail(cause);
    } finally {
      setSending(false);
    }
  };

  const sendLocation = async () => {
    if (!room || !uid || locating) return;
    setLocating(true);
    try {
      const location = await layViTriHienTai();
      activity.current?.clearTyping();
      await guiTinFirebase(id, uid, room, { type: 'location', ...location });
      listRef.current?.scrollToOffset({ offset: 0 });
    } catch (cause) {
      fail(cause);
    } finally {
      setLocating(false);
    }
  };

  const sendPhoto = async ({ asset, url }: PendingPhoto) => {
    if (!uid || !room) return;
    setPhoto({ asset, url });
    try {
      url = url || (await uploadChatPhoto(asset));
      activity.current?.clearTyping();
      await guiTinFirebase(id, uid, room, { type: 'image', imageUrl: url });
      setPhoto(undefined);
      listRef.current?.scrollToOffset({ offset: 0 });
    } catch (cause) {
      setPhoto({ asset, url, error: loiFirebase(cause) });
    }
  };

  const choosePhoto = async (source: 'camera' | 'library') => {
    setPicking(true);
    try {
      const asset = await pickChatPhoto(source);
      if (asset) {
        listRef.current?.scrollToOffset({ offset: 0 });
        await sendPhoto({ asset });
      }
    } catch (cause) {
      fail(cause);
    } finally {
      setPicking(false);
    }
  };

  const selected = messages.find(
    ([key, message]) => key === selectedId && !message.recalled,
  );
  const filteredMessages = search.trim()
    ? messages.filter(([, message]) => message.text?.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    : messages;
  const replyMessage = messages.find(([key]) => key === replyToId)?.[1];
  const lastOwn = messages.find(([, message]) => message.senderId === uid)?.[0];
  const conversation = chat.troChuyen.find(item => item.id === id);
  const memberIds = Object.keys(room?.members || {});
  const group = room?.type === 'group';
  const peerId =
    memberIds.find(member => member !== uid) || route.params.nguoiDungId;
  const peer = chat.nguoiDung.find(person => person.id === peerId);
  const typingMembers = memberIds.filter(
    member =>
      member !== uid &&
      Object.values(typing[member] || {}).some(stamp => now - stamp < 3000),
  );
  const minutes = peer?.lastOnline
    ? Math.max(0, Math.floor((now - peer.lastOnline) / 60000))
    : undefined;
  const subtitle = group
    ? `${conversation?.onlineCount || 0} đang trực tuyến · ${
        memberIds.length
      } thành viên`
    : typingMembers.length
    ? 'đang soạn tin…'
    : peer?.online
    ? 'Đang trực tuyến'
    : minutes !== undefined
    ? `Hoạt động ${minutes} phút trước`
    : 'Chưa có thông tin hoạt động';
  const title = group ? room.name : peer?.ten || 'Cuộc trò chuyện';

  const copySelected = ([, message]: MessageEntry) => {
    const value =
      message.type === 'image'
        ? message.imageUrl
        : message.type === 'location'
        ? mapUrl(message.latitude!, message.longitude!)
        : message.text;
    if (value) Clipboard.setString(value);
    setSelectedId(undefined);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <BieuTuong name="back" color={theme.colors.text} />
          </TouchableOpacity>
          <AnhDaiDien
            source={group ? avatars.group : peer?.avatar || avatars.an}
            size={44}
            online={peer?.online}
          />
          <View style={styles.headerCopy}>
            <Text style={styles.name} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.status} accessibilityLiveRegion="polite">
              {subtitle}
            </Text>
            {group && typingMembers.length > 0 && (
              <Text style={styles.status}>
                {chat.nguoiDung.find(person => person.id === typingMembers[0])
                  ?.tenNgan || 'Thành viên'}{' '}
                đang soạn tin…
              </Text>
            )}
          </View>
          {group && room?.createdBy === uid && (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quản trị nhóm" style={styles.back} onPress={() => navigation.navigate('QuanTriNhom', { troChuyenId: id })}>
              <Text style={styles.status}>Quản lý</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm trong cuộc trò chuyện"
          placeholderTextColor={theme.colors.secondary}
          accessibilityLabel="Tìm kiếm tin nhắn"
          style={extras.search}
        />
        {roomError || room === null ? (
          <TrangRong title={roomError || 'Không tìm thấy cuộc trò chuyện'} />
        ) : !loading && !filteredMessages.length && !error && !photo ? (
          <View style={[styles.messages, { justifyContent: 'center' }]}>
            <TrangRong title={search.trim() ? 'Không tìm thấy tin nhắn' : 'Chưa có tin nhắn'} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            inverted
            style={styles.messages}
            data={filteredMessages}
            keyExtractor={([key]) => key}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 56,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.messageContent}
            onEndReached={older && !error ? loadMore : undefined}
            onEndReachedThreshold={0.25}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={loading ? <ActivityIndicator color={theme.colors.primary} /> : undefined}
            ListHeaderComponent={
              photo ? (
                <View style={extras.pending}>
                  <Image
                    source={{ uri: photo.asset.uri }}
                    style={extras.thumbnail}
                    resizeMode="cover"
                  />
                  {photo.error ? (
                    <>
                      <Text style={extras.error}>{photo.error}</Text>
                      <View style={extras.actions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => sendPhoto(photo)}
                        >
                          <Text style={extras.action}>Thử lại</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setPhoto(undefined)}
                        >
                          <Text style={extras.action}>Bỏ ảnh</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <ActivityIndicator
                      accessibilityLabel="Đang tải ảnh"
                      color={theme.colors.primary}
                    />
                  )}
                </View>
              ) : undefined
            }
            ListFooterComponent={
              loadingOlder ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : error ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={messages.length ? loadMore : retry}
                >
                  <Text style={extras.error}>{error} · Thử lại</Text>
                </Pressable>
              ) : undefined
            }
            renderItem={({ item: [key, message], index }) => {
              const outgoing = message.senderId === uid;
              const showDate =
                !messages[index + 1] ||
                dinhDangNgay(messages[index + 1][1].createdAt) !==
                  dinhDangNgay(message.createdAt);
              const seenAt =
                key === lastOwn
                  ? Math.max(
                      0,
                      ...memberIds
                        .filter(member => member !== uid)
                        .map(member => {
                          const read = receipts[member];
                          return read &&
                            (read.messageAt > message.createdAt ||
                              (read.messageAt === message.createdAt &&
                                read.messageId >= key))
                            ? read.seenAt
                            : 0;
                        }),
                    )
                  : 0;
              return (
                <View>
                  {showDate && (
                    <Text style={styles.date}>
                      {dinhDangNgay(message.createdAt)}
                    </Text>
                  )}
                  <BongBongTinNhan
                    message={message}
                    outgoing={outgoing}
                    senderName={
                      group && !outgoing
                        ? chat.nguoiDung.find(
                            person => person.id === message.senderId,
                          )?.ten || 'Thành viên'
                        : undefined
                    }
                    delivery={
                      key === lastOwn
                        ? seenAt
                          ? `Đã xem · ${dinhDangGio(seenAt)}`
                          : 'Đã gửi'
                        : undefined
                    }
                    onMenu={() => setSelectedId(key)}
                    onImage={setViewer}
                    onReply={() => setReplyToId(key)}
                    reply={message.replyTo}
                    onReplyPress={() => {
                      const targetIndex = messages.findIndex(([messageId]) => messageId === message.replyTo?.messageId);
                      if (targetIndex >= 0) listRef.current?.scrollToIndex({ index: targetIndex, animated: true });
                    }}
                  />
                </View>
              );
            }}
          />
        )}
        {canWrite && (
          <View style={styles.composer}>
            {!!replyMessage && (
              <Pressable onPress={() => setReplyToId(undefined)} style={extras.replyDraft}>
                <Text numberOfLines={1} style={extras.replyText}>Đang trả lời: {replyMessage.text || messagePreview(replyMessage)} · Hủy</Text>
              </Pressable>
            )}
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Gửi ảnh', undefined, [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Chụp ảnh', onPress: () => choosePhoto('camera') },
                  {
                    text: 'Chọn từ thư viện',
                    onPress: () => choosePhoto('library'),
                  },
                ])
              }
              disabled={picking || !!photo}
              style={styles.locationButton}
              accessibilityRole="button"
              accessibilityLabel="Gửi ảnh"
            >
              <Text style={styles.locationIcon}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={sendLocation}
              disabled={locating}
              style={styles.locationButton}
              accessibilityRole="button"
              accessibilityLabel="Gửi vị trí hiện tại"
            >
              <Text style={styles.locationIcon}>{locating ? '…' : '📍'}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={value => {
                setText(value);
                activity.current?.changeTyping(Boolean(value.trim()));
              }}
              placeholder="Nhập tin nhắn…"
              placeholderTextColor={theme.colors.secondary}
              accessibilityLabel="Nội dung tin nhắn"
              multiline
              maxLength={2000}
              textAlignVertical="center"
            />
            <TouchableOpacity
              onPress={sendText}
              disabled={!text.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              style={[styles.send, !text.trim() && styles.disabled]}
            >
              <BieuTuong name="send" color={theme.colors.white} size={22} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(undefined)}
      >
        <View style={extras.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedId(undefined)}
            accessibilityLabel="Đóng menu"
          />
          {!!selected && (
            <View style={extras.menu}>
              <Text style={extras.preview} numberOfLines={2}>
                {messagePreview(selected[1])}
              </Text>
              <View style={extras.actions}>
                {reactions.map(reaction => (
                  <Pressable
                    key={reaction}
                    accessibilityRole="button"
                    accessibilityLabel={`Thả cảm xúc ${reaction}`}
                    onPress={() => {
                      setSelectedId(undefined);
                      if (uid)
                        reactToMessage(id, uid, selected, reaction).catch(fail);
                    }}
                  >
                    <Text style={extras.emoji}>{reaction}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => copySelected(selected)}
              >
                <Text style={extras.action}>Sao chép</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => {
                setReplyToId(selected[0]);
                setSelectedId(undefined);
              }}>
                <Text style={extras.action}>Trả lời</Text>
              </Pressable>
              {selected[1].senderId === uid && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedId(undefined);
                    Alert.alert(
                      'Thu hồi tin nhắn?',
                      'Tin sẽ được thu hồi với tất cả thành viên.',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        {
                          text: 'Thu hồi',
                          style: 'destructive',
                          onPress: () =>
                            recallMessage(id, selected[0]).catch(fail),
                        },
                      ],
                    );
                  }}
                >
                  <Text style={extras.action}>Thu hồi</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Modal>
      <Modal
        visible={!!viewer}
        animationType="fade"
        onRequestClose={() => setViewer(undefined)}
      >
        <SafeAreaView style={extras.viewer}>
          <Pressable
            style={extras.close}
            accessibilityRole="button"
            accessibilityLabel="Đóng ảnh"
            onPress={() => setViewer(undefined)}
          >
            <BieuTuong name="close" color="#fff" />
          </Pressable>
          {!!viewer && (
            <Image
              source={{ uri: viewer }}
              resizeMode="contain"
              style={extras.fullImage}
            />
          )}
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const extras = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#11182777',
  },
  menu: {
    padding: 16,
    gap: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
  },
  preview: { paddingBottom: 8, color: theme.colors.secondary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  emoji: { fontSize: 24, padding: 6 },
  action: { padding: 8, color: theme.colors.primary, fontWeight: '600' },
  viewer: { flex: 1, backgroundColor: '#0d0d10' },
  search: { marginHorizontal: 16, marginVertical: 6, padding: 10, borderRadius: 12, backgroundColor: theme.colors.muted, color: theme.colors.text },
  replyDraft: { position: 'absolute', bottom: 66, left: 0, right: 0, backgroundColor: theme.colors.soft, padding: 8, borderRadius: 8 },
  replyText: { color: theme.colors.primary },
  fullImage: { flex: 1, width: '100%' },
  close: { padding: 14, alignSelf: 'flex-end' },
  pending: {
    alignSelf: 'flex-end',
    gap: 8,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.soft,
  },
  thumbnail: { width: 124, height: 90, borderRadius: 8, alignSelf: 'flex-end' },
  error: { color: theme.colors.text, padding: 8 },
});
