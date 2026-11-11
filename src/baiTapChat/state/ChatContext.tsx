import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { avatars } from '../assets/avatars';
import type { TrangThaiChat, TaiKhoan } from '../types';
import { firebaseDaCauHinh, loiFirebase } from '../../services/firebase';
import {
  langNgheTaiKhoan,
  dangKyFirebase,
  dangNhapFirebase,
  dangXuatFirebase,
  capNhatHoSo,
} from '../../services/authService';
import {
  langNgheCuocTroChuyen,
  moCuocTroChuyen,
  type ChatRow,
} from '../../services/chatService';
import {
  readNotifications,
  watchNotifications,
  type RemoteNotification,
} from '../../services/notificationService';
import { batTrangThaiOnline } from '../../services/presenceService';
import { langNgheDanhBa } from '../../services/userService';
import { thoiGianTroChuyen } from '../utils/thoiGian';

interface ChatContextValue extends TrangThaiChat {
  loading: boolean;
  error: string;
  foreground: boolean;
  chatRows: Record<string, ChatRow>;
  dangNhap: (email: string, password: string) => Promise<boolean>;
  dangKy: (name: string, email: string, password: string) => Promise<boolean>;
  dangXuat: () => Promise<void>;
  moChat: (uid: string) => Promise<string>;
  docThongBao: (id: string) => Promise<void>;
  docTatCaThongBao: () => Promise<void>;
  doiOnline: (online: boolean) => void;
  doiBadge: (badge: boolean) => void;
  capNhatHoSoNguoiDung: (name: string, photoURL?: string) => Promise<void>;
  moDuAnCu?: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({
  children,
  moDuAnCu,
}: PropsWithChildren<{ moDuAnCu?: () => void }>) => {
  const [taiKhoan, setTaiKhoan] = useState<TaiKhoan | null>(null);
  const [nguoiDung, setNguoiDung] = useState<TrangThaiChat['nguoiDung']>([]);
  const [chatRows, setChatRows] = useState<Record<string, ChatRow>>({});
  const [notices, setNotices] = useState<Record<string, RemoteNotification>>(
    {},
  );
  const [hienThiOnline, doiOnline] = useState(true);
  const [hienThiBadge, doiBadge] = useState(true);
  const [loading, setLoading] = useState(firebaseDaCauHinh);
  const [error, setError] = useState('');
  const [foreground, setForeground] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive',
  );
  const presenceStop = useRef<(() => Promise<void>) | null>(null);
  const uid = taiKhoan?.id;
  const reportError = (cause: unknown) => setError(loiFirebase(cause));

  useEffect(() => {
    if (!firebaseDaCauHinh()) {
      setError('Chưa cấu hình Firebase trong src/services/firebaseConfig.ts.');
      return;
    }
    return langNgheTaiKhoan(
      user => {
        setError('');
        setLoading(false);
        setTaiKhoan(
          user
            ? {
                id: user.uid,
                taiKhoan: user.email || '',
                tenHienThi:
                  user.displayName || user.email?.split('@')[0] || 'Bạn',
                avatar: user.photoURL ? { uri: user.photoURL } : avatars.me,
                photoURL: user.photoURL || undefined,
              }
            : null,
        );
        if (!user) {
          setNguoiDung([]);
          setChatRows({});
          setNotices({});
          doiOnline(true);
          doiBadge(true);
        }
      },
      cause => {
        reportError(cause);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next =>
      setForeground(next === 'active'),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const stopUsers = langNgheDanhBa(
      uid,
      danhBa => {
        setNguoiDung(
          danhBa.map(nguoi => ({
            ...nguoi,
            tenNgan: nguoi.ten.split(' ').pop() || nguoi.ten,
            avatar: nguoi.photoURL ? { uri: nguoi.photoURL } : avatars.an,
          })),
        );
      },
      ten =>
        setTaiKhoan(current =>
          current?.id === uid ? { ...current, tenHienThi: ten } : current,
        ),
      reportError,
    );
    const stopChats = langNgheCuocTroChuyen(uid, setChatRows, reportError);
    const stopNotices = watchNotifications(uid, setNotices, reportError);
    return () => {
      stopUsers();
      stopChats();
      stopNotices();
    };
  }, [uid]);

  useEffect(() => {
    if (!uid || !foreground || !hienThiOnline) return;
    const stop = batTrangThaiOnline(uid, reportError);
    presenceStop.current = stop;
    return () => {
      if (presenceStop.current === stop) presenceStop.current = null;
      stop().catch(reportError);
    };
  }, [uid, foreground, hienThiOnline]);

  const troChuyen = Object.entries(chatRows)
    .map(([id, { room, summary, legacyPeer, last }]) => {
      const peer =
        legacyPeer ||
        Object.keys(room?.members || {}).find(member => member !== uid);
      const onlineCount =
        nguoiDung.filter(person => person.online && room?.members[person.id])
          .length +
        Number(
          Boolean(foreground && hienThiOnline && uid && room?.members[uid]),
        );
      const user =
        room?.type === 'group'
          ? {
              id,
              ten: room.name!,
              tenNgan: room.name!,
              avatar: avatars.group,
              online: onlineCount > 0,
              laNhom: true,
            }
          : nguoiDung.find(person => person.id === peer);
      return {
        id,
        nguoiDungId: peer || '',
        soChuaDoc: summary?.unread || 0,
        user,
        last,
        onlineCount,
        updatedAt: last?.[1].createdAt || summary?.updatedAt || 0,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const thongBao: TrangThaiChat['thongBao'] = Object.entries(notices)
    .sort(([, a], [, b]) => b.createdAt - a.createdAt)
    .map(([id, notice]) => ({
      id,
      troChuyenId: notice.convId,
      daDoc: notice.read,
      tieuDe:
        nguoiDung.find(person => person.id === notice.fromUid)?.ten ||
        'UDU Chat',
      noiDung: notice.text,
      thoiGian: thoiGianTroChuyen(notice.createdAt),
      loai:
        notice.type === 'group'
          ? 'nhom'
          : notice.type === 'reaction'
          ? 'heThong'
          : 'tinNhan',
    }));

  const authenticate = async (action: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try {
      await action();
      return true;
    } catch (cause) {
      reportError(cause);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: ChatContextValue = {
    taiKhoan,
    nguoiDung,
    troChuyen,
    thongBao,
    chatRows,
    foreground,
    hienThiOnline,
    hienThiBadge,
    loading,
    error,
    moDuAnCu,
    doiOnline,
    doiBadge,
    capNhatHoSoNguoiDung: async (name, photoURL) => {
      await capNhatHoSo(name, photoURL);
      setTaiKhoan(current => current ? { ...current, tenHienThi: name.trim(), ...(photoURL ? { photoURL, avatar: { uri: photoURL } } : {}) } : current);
    },
    dangNhap: (email, password) =>
      authenticate(() => dangNhapFirebase(email, password)),
    dangKy: (name, email, password) =>
      authenticate(() => dangKyFirebase(name, email, password)),
    dangXuat: async () => {
      try {
        await presenceStop.current?.();
        await dangXuatFirebase();
      } catch (cause) {
        reportError(cause);
      }
    },
    moChat: async peer => {
      if (!uid) throw new Error('Vui lòng đăng nhập.');
      return moCuocTroChuyen(uid, peer);
    },
    docThongBao: async id => {
      if (uid && !notices[id]?.read) await readNotifications(uid, [id]);
    },
    docTatCaThongBao: async () => {
      if (uid)
        await readNotifications(
          uid,
          thongBao.filter(item => !item.daDoc).map(item => item.id),
        );
    },
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat cần được đặt trong ChatProvider.');
  return context;
};
