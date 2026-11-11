import {
  conversationId,
  mapUrl,
  compareMessages,
  messagePreview,
  type MessageEntry,
} from '../src/services/chatModel';
import { kiemTraDangKy } from '../src/baiTapChat/utils/dangKy';
import { kiemTraDangNhap } from '../src/baiTapChat/utils/dangNhap';
import { khopTimKiem } from '../src/baiTapChat/utils/timKiem';

test('both users open one deterministic conversation and cannot chat with themselves', () => {
  expect(conversationId('b', 'a')).toBe(conversationId('a', 'b'));
  expect(() => conversationId('a', 'a')).toThrow();
});
test('message ordering uses server time and push keys break ties', () => {
  const entries: MessageEntry[] = [
    ['z', { senderId: 'b', createdAt: 10, type: 'text' }],
    ['a', { senderId: 'a', createdAt: 20, type: 'text' }],
    ['A', { senderId: 'b', createdAt: 20, type: 'text' }],
  ];
  expect(entries.sort(compareMessages).map(([id]) => id)).toEqual([
    'z',
    'A',
    'a',
  ]);
});
test('preview covers image, location and recalled messages', () => {
  const message = { senderId: 'b', createdAt: 10 };
  expect(messagePreview({ ...message, type: 'image' })).toBe('📷 Hình ảnh');
  expect(messagePreview({ ...message, type: 'location' })).toBe('📍 Vị trí');
  expect(messagePreview({ ...message, type: 'image', recalled: true })).toBe(
    'Tin nhắn đã được thu hồi',
  );
});
test('requires email and password and rejects malformed email', () => {
  expect(kiemTraDangNhap(' ', ' ').taiKhoan).toBeDefined();
  expect(kiemTraDangNhap('hung', '123456').taiKhoan).toBeDefined();
  expect(kiemTraDangNhap('hung@example.com', '123456')).toEqual({
    taiKhoan: undefined,
    matKhau: undefined,
  });
});
test('registration checks name, password length and confirmation', () => {
  expect(kiemTraDangKy('', 'a@example.com', '123456', '123456')).toContain(
    'họ tên',
  );
  expect(kiemTraDangKy('An', 'a@example.com', '12345', '12345')).toContain('6');
  expect(kiemTraDangKy('An', 'a@example.com', '123456', 'different')).toContain(
    'khớp',
  );
  expect(kiemTraDangKy('An', 'a@example.com', '123456', '123456')).toBe('');
});
test('location link targets exactly the shared coordinates and rejects invalid values', () => {
  expect(mapUrl(10.762, 106.66)).toBe(
    'https://www.google.com/maps/search/?api=1&query=10.762,106.66',
  );
  expect(() => mapUrl(100, 0)).toThrow();
  expect(() => mapUrl(NaN, 0)).toThrow();
});
test('Vietnamese contact search ignores accents and case', () => {
  expect(khopTimKiem('Nguyễn An', 'NGUYEN AN')).toBe(true);
  expect(khopTimKiem('Hoàng Linh', 'khong co')).toBe(false);
});
