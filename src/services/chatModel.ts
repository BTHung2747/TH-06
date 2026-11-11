export interface RemoteMessage {
  senderId: string;
  text?: string;
  createdAt: number;
  type: 'text' | 'location' | 'image';
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  recalled?: boolean;
  reactions?: Record<string, Reaction>;
  replyTo?: { messageId: string; text: string; senderId: string };
}

export type Reaction = '👍' | '❤️' | '😂' | '😮' | '😢';
export const reactions: Reaction[] = ['👍', '❤️', '😂', '😮', '😢'];

export interface Conversation {
  type: 'direct' | 'group';
  name?: string;
  members: Record<string, true>;
  createdBy: string;
  createdAt: number;
  participantA?: string;
  participantB?: string;
}

export interface ChatSummary {
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt: number;
  unread: number;
}

export interface ReadReceipt {
  messageId: string;
  messageAt: number;
  seenAt: number;
}

export type MessageEntry = [string, RemoteMessage];
export const PAGE_SIZE = 20;

export const conversationId = (a: string, b: string) => {
  if (!a || !b || a === b) throw new Error('Cần hai người dùng khác nhau.');
  return [a, b].sort().join('_');
};

export const compareMessages = (
  [a, first]: MessageEntry,
  [b, second]: MessageEntry,
) => first.createdAt - second.createdAt || (a < b ? -1 : a > b ? 1 : 0);

export const messagePreview = (message: RemoteMessage) => {
  if (message.recalled) return 'Tin nhắn đã được thu hồi';
  if (message.type === 'image') return '📷 Hình ảnh';
  if (message.type === 'location') return '📍 Vị trí';
  return message.text || '';
};

export const mapUrl = (latitude: number, longitude: number) => {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error('Tọa độ vị trí không hợp lệ.');
  }
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};
