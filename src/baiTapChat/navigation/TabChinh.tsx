import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ThanhTab } from '../components/ThanhTab';
import { HomeChat } from '../screens/Home';
import { DanhBaChat } from '../screens/DanhBa';
import { ThongBaoChat } from '../screens/ThongBao';
import { CaiDatChat } from '../screens/CaiDat';
import { themeChat as theme } from '../styles/theme';
import type { ChatTabs } from './types';

const Tab = createBottomTabNavigator<ChatTabs>();
const hienThiThanhTab = (props: BottomTabBarProps) => <ThanhTab {...props} />;

export const TabChinh = () => (
  <Tab.Navigator
    tabBar={hienThiThanhTab}
    screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: theme.colors.background },
    }}
  >
    <Tab.Screen name="Home" component={HomeChat} />
    <Tab.Screen name="DanhBa" component={DanhBaChat} />
    <Tab.Screen name="ThongBao" component={ThongBaoChat} />
    <Tab.Screen name="CaiDat" component={CaiDatChat} />
  </Tab.Navigator>
);
