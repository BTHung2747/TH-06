import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  messagePreview,
  reactions,
  type RemoteMessage,
} from '../../../services/chatModel';
import { moGoogleMaps } from '../../../services/locationService';
import { dinhDangGio } from '../../utils/thoiGian';
import { themeChat as theme } from '../../styles/theme';
import { styles } from './styles';

export const BongBongTinNhan = ({
  message,
  outgoing,
  senderName,
  delivery,
  onMenu,
  onImage,
  onReply,
  onReplyPress,
  reply,
}: {
  message: RemoteMessage;
  outgoing: boolean;
  senderName?: string;
  delivery?: string;
  onMenu: () => void;
  onImage: (url: string) => void;
  onReply: () => void;
  onReplyPress: () => void;
  reply?: RemoteMessage['replyTo'];
}) => {
  const textStyle = [styles.text, outgoing && styles.outgoingText];
  const onPress = () => {
    if (message.recalled) return;
    if (message.type === 'image' && message.imageUrl) onImage(message.imageUrl);
    if (
      message.type === 'location' &&
      message.latitude !== undefined &&
      message.longitude !== undefined
    ) {
      moGoogleMaps(message.latitude, message.longitude).catch(() =>
        Alert.alert('Google Maps', 'Không mở được bản đồ trên thiết bị.'),
      );
    }
  };
  return (
    <View style={[bubbleLayout.wrapper, outgoing && bubbleLayout.right]}>
      {!!senderName && <Text style={styles.sender}>{senderName}</Text>}
      {!!reply && (
        <Pressable onPress={onReplyPress} style={bubbleLayout.quote}>
          <Text numberOfLines={2} style={bubbleLayout.quoteText}>{reply.text}</Text>
        </Pressable>
      )}
      <Pressable
        style={[
          styles.bubble,
          outgoing ? styles.outgoing : styles.incoming,
          bubbleLayout.bubble,
        ]}
        onPress={
          !message.recalled && message.type !== 'text' ? onPress : undefined
        }
        onLongPress={message.recalled ? undefined : onMenu}
        accessibilityLabel={messagePreview(message)}
        accessibilityHint={
          message.recalled ? undefined : 'Nhấn giữ để mở thao tác'
        }
        accessibilityActions={
          message.recalled
            ? undefined
            : [{ name: 'longpress', label: 'Thao tác tin nhắn' }]
        }
        onAccessibilityAction={onMenu}
      >
        {!message.recalled && message.type === 'image' && message.imageUrl ? (
          <Image
            source={{ uri: message.imageUrl }}
            style={bubbleLayout.photo}
            resizeMode="cover"
          />
        ) : (
          <Text style={textStyle}>{messagePreview(message)}</Text>
        )}
        {!message.recalled && message.type === 'location' && (
          <>
            <Text style={textStyle}>
              {message.latitude?.toFixed(5)}, {message.longitude?.toFixed(5)}
            </Text>
            <Text style={[styles.time, outgoing && styles.outgoingText]}>
              Mở Google Maps ↗
            </Text>
          </>
        )}
        <Text style={[styles.time, outgoing && styles.outgoingText]}>
          {dinhDangGio(message.createdAt)}
        </Text>
      </Pressable>
      {!message.recalled && !!message.reactions && (
        <View style={bubbleLayout.reactions}>
          {reactions.map(emoji => {
            const count = Object.values(message.reactions || {}).filter(
              value => value === emoji,
            ).length;
            return (
              count > 0 && (
                <Text key={emoji} style={bubbleLayout.reaction}>
                  {emoji}
                  {count > 1 ? ` ${count}` : ''}
                </Text>
              )
            );
          })}
        </View>
      )}
      {!!delivery && <Text style={bubbleLayout.delivery}>{delivery}</Text>}
    </View>
  );
};

const bubbleLayout = StyleSheet.create({
  wrapper: { alignSelf: 'flex-start', maxWidth: '85%', marginBottom: 14 },
  right: { alignSelf: 'flex-end' },
  bubble: { maxWidth: '100%', marginBottom: 0 },
  photo: { width: 192, height: 144, borderRadius: 12 },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  reaction: {
    color: theme.colors.text,
    backgroundColor: theme.colors.muted,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  delivery: {
    color: theme.colors.secondary,
    textAlign: 'right',
    fontSize: 11,
    marginTop: 4,
  },
  quote: { maxWidth: '100%', borderLeftWidth: 3, borderLeftColor: theme.colors.primary, paddingLeft: 8, marginBottom: 8 },
  quoteText: { color: theme.colors.secondary, fontSize: 12 },
});
