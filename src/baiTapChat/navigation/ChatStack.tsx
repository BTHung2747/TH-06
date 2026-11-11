import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DangNhapChat } from '../screens/DangNhap';
import { DangKyChat } from '../screens/DangKy';
import { TaoNhom } from '../screens/TaoNhom';
import { QuanTriNhom } from '../screens/QuanTriNhom';
import NoiDungChat from '../screens/NoiDungChat/index';
import { useChat } from '../state/ChatContext';
import { themeChat as theme } from '../styles/theme';
import { TabChinh } from './TabChinh';
import type { ChatRoutes } from './types';

const Stack = createNativeStackNavigator<ChatRoutes>();
export const ChatStack = () => {
  const { taiKhoan } = useChat();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {taiKhoan ? (
        <Stack.Group navigationKey="signed-in">
          <Stack.Screen name="Chinh" component={TabChinh} />
          <Stack.Screen name="TaoNhom" component={TaoNhom} />
          <Stack.Screen name="QuanTriNhom" component={QuanTriNhom} />
          <Stack.Screen name="NoiDungChat" component={NoiDungChat} />
        </Stack.Group>
      ) : (
        <Stack.Group navigationKey="signed-out">
          <Stack.Screen name="DangNhap" component={DangNhapChat} />
          <Stack.Screen name="DangKy" component={DangKyChat} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
