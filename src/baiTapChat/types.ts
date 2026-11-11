import type { ImageSourcePropType } from 'react-native';
import type { MessageEntry } from '../services/chatModel';

export interface NguoiDung {
  id: string;
  ten: string;
  tenNgan: string;
  avatar: ImageSourcePropType;
  photoURL?: string;
  online: boolean;
  lastOnline?: number;
  laNhom?: boolean;
}

export interface TaiKhoan {
  id?: string;
  taiKhoan: string;
  tenHienThi: string;
  avatar: ImageSourcePropType;
  photoURL?: string;
}

export interface TroChuyen {
  id: string;
  nguoiDungId: string;
  soChuaDoc: number;
  user?: NguoiDung;
  last?: MessageEntry;
  onlineCount: number;
  updatedAt: number;
}

export interface ThongBao {
  id: string;
  troChuyenId: string;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  daDoc: boolean;
  loai: 'tinNhan' | 'nhom' | 'heThong';
}

export interface TrangThaiChat {
  taiKhoan: TaiKhoan | null;
  nguoiDung: NguoiDung[];
  troChuyen: TroChuyen[];
  thongBao: ThongBao[];
  hienThiOnline: boolean;
  hienThiBadge: boolean;
}
