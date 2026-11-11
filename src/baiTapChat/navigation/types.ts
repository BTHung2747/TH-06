import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ChatTabs = {
  Home: undefined;
  DanhBa: undefined;
  ThongBao: undefined;
  CaiDat: undefined;
};
export type ChatRoutes = {
  DangNhap: undefined;
  DangKy: undefined;
  Chinh: NavigatorScreenParams<ChatTabs> | undefined;
  TaoNhom: undefined;
  NoiDungChat: { troChuyenId: string; nguoiDungId?: string };
  QuanTriNhom: { troChuyenId: string };
};
export type ChatTabScreenProps<Name extends keyof ChatTabs> =
  CompositeScreenProps<
    BottomTabScreenProps<ChatTabs, Name>,
    NativeStackScreenProps<ChatRoutes, 'Chinh'>
  >;
