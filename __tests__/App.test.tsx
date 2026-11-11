import React from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import App from '../App';
import { HomeChat } from '../src/baiTapChat/screens/Home';
import { DangNhapChat } from '../src/baiTapChat/screens/DangNhap';
import { DangKyChat } from '../src/baiTapChat/screens/DangKy';
import { NoiDungChat } from '../src/baiTapChat/screens/NoiDungChat';
import { HangDanhBa } from '../src/baiTapChat/components/HangDanhBa';
import type { ChatRow } from '../src/services/chatService';
import type { MessageEntry } from '../src/services/chatModel';

let mockAuthCallback: (user: unknown) => void;
let mockChatsCallback: (chats: Record<string, ChatRow>) => void;
let mockUser: { uid: string; email: string; displayName: string } | null = null;
let mockMessages: MessageEntry[];
let mockRooms: Record<string, ChatRow>;
const mockStop = jest.fn();
const mockSend = jest.fn();
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_: unknown, callback: typeof mockAuthCallback) => {
    mockAuthCallback = callback;
    callback(null);
    return mockStop;
  },
}));
jest.mock('firebase/database', () => ({
  ref: (_: unknown, path: string) => ({ path }),
  set: jest.fn(),
  serverTimestamp: () => 100,
  onValue: (
    target: { path: string },
    callback: (snapshot: { val: () => unknown }) => void,
  ) => {
    callback({
      val: () =>
        target.path === 'users'
          ? { me: { name: 'Hưng' }, an: { name: 'Nguyễn An' } }
          : target.path === 'presence'
          ? { an: { connections: { phone: true } } }
          : target.path === 'notifications/me'
          ? {
              one: {
                convId: 'an_me',
                type: 'message',
                fromUid: 'an',
                text: 'Chào bạn',
                createdAt: 100,
                read: false,
              },
            }
          : false,
    });
    return mockStop;
  },
}));
jest.mock('../src/services/firebase', () => ({
  firebaseDaCauHinh: () => true,
  getFirebase: () => ({ database: {}, auth: { currentUser: mockUser } }),
  loiFirebase: (error: Error) => error.message,
}));
jest.mock('../src/services/authService', () => ({
  langNgheTaiKhoan: (callback: typeof mockAuthCallback) => {
    mockAuthCallback = callback;
    callback(null);
    return mockStop;
  },
  damBaoHoSo: jest.fn(async () => {}),
  dangNhapFirebase: async (email: string, password: string) => {
    if (password !== '123456')
      throw new Error('Email hoặc mật khẩu không đúng.');
    mockUser = { uid: 'me', email, displayName: 'Hưng' };
    mockAuthCallback(mockUser);
  },
  dangKyFirebase: jest.fn(),
  dangXuatFirebase: async () => {
    mockUser = null;
    mockAuthCallback(null);
  },
}));
jest.mock('../src/services/chatService', () => ({
  langNgheCuocTroChuyen: (_: unknown, callback: typeof mockChatsCallback) => {
    mockChatsCallback = callback;
    callback({ ...mockRooms });
    return mockStop;
  },
  moCuocTroChuyen: async () => 'an_me',
  watchConversation: (id: string, receive: (room: unknown) => void) => {
    receive(mockRooms[id].room);
    return mockStop;
  },
  watchMessages: (_: string, receive: (items: MessageEntry[]) => void) => {
    receive(mockMessages);
    return mockStop;
  },
  watchMessagesSince: (
    _: string,
    __: unknown,
    receive: (items: MessageEntry[]) => void,
  ) => {
    receive(mockMessages);
    return mockStop;
  },
  watchReceipt: () => mockStop,
  danhDauDaDoc: async (id: string) => {
    mockRooms[id].summary!.unread = 0;
    mockChatsCallback({ ...mockRooms });
  },
  guiTinFirebase: async (
    _: string,
    __: string,
    ___: unknown,
    payload: { text: string },
  ) => {
    mockSend(payload.text);
  },
}));
jest.mock('../src/services/locationService', () => ({
  layViTriHienTai: async () => ({ latitude: 10, longitude: 106 }),
  moGoogleMaps: jest.fn(),
}));
let tree: Renderer.ReactTestRenderer;
const button = (label: string) =>
  tree.root
    .findAllByType(TouchableOpacity)
    .find(node => node.props.accessibilityLabel === label)!;
const press = async (label: string) => {
  await act(async () => {
    expect(button(label)).toBeDefined();
    button(label).props.onPress();
  });
};
const input = async (label: string, value: string) => {
  await act(async () =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
};
beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockUser = null;
  mockMessages = [
    [
      'first',
      { senderId: 'an', text: 'Chào bạn', createdAt: 100, type: 'text' },
    ],
  ];
  mockRooms = {
    an_me: {
      room: {
        type: 'direct',
        createdBy: 'an',
        createdAt: 1,
        members: { an: true, me: true },
      },
      summary: {
        unread: 1,
        updatedAt: 100,
        lastMessage: 'first',
        lastSenderId: 'an',
      },
      last: mockMessages[0],
    },
  };
  await act(async () => {
    tree = Renderer.create(<App />);
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
  jest.clearAllTimers();
  jest.useRealTimers();
});
test('Firebase auth errors, contacts, sending, unread, notification tabs and logout', async () => {
  await press('Tạo tài khoản');
  expect(tree.root.findByType(DangKyChat)).toBeDefined();
  await press('Đăng ký');
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => node.props.children === 'Vui lòng nhập họ tên.'),
  ).toBe(true);
  await press('Về đăng nhập');
  await input('Email', 'hung@example.com');
  await input('Mật khẩu', 'wrong');
  await press('Đăng nhập');
  expect(tree.root.findByType(DangNhapChat)).toBeDefined();
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => node.props.children === 'Email hoặc mật khẩu không đúng.'),
  ).toBe(true);
  await input('Mật khẩu', '123456');
  await press('Đăng nhập');
  expect(tree.root.findByType(HomeChat)).toBeDefined();
  expect(button('Tin nhắn, 1 tin nhắn chưa đọc')).toBeDefined();
  await press('Danh bạ');
  await input('Tìm kiếm danh bạ', 'NGUYEN an');
  const contacts = tree.root.findAllByType(HangDanhBa);
  expect(contacts).toHaveLength(1);
  await act(async () => contacts[0].props.onPress());
  expect(tree.root.findByType(NoiDungChat)).toBeDefined();
  expect(button('Gửi tin nhắn').props.disabled).toBe(true);
  await input('Nội dung tin nhắn', '  Xin chào realtime  ');
  await press('Gửi tin nhắn');
  expect(mockSend).toHaveBeenCalledTimes(1);
  await press('Quay lại');
  expect(button('Tin nhắn')).toBeDefined();
  await press('Thông báo, 1 thông báo chưa đọc');
  await press('Cài đặt');
  await press('Đăng xuất');
  expect(tree.root.findByType(DangNhapChat)).toBeDefined();
  expect(tree.root.findAllByType(HomeChat)).toHaveLength(0);
  expect(mockStop).toHaveBeenCalled();
}, 30000);
