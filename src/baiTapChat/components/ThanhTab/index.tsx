import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ChatTabs } from '../../navigation/types';
import type { ChatIconName } from '../../assets/icons';
import { useChat } from '../../state/ChatContext';
import { themeChat as theme } from '../../styles/theme';
import { BieuTuong } from '../common';
import { styles } from './styles';

const labels: Record<keyof ChatTabs, string> = {
  Home: 'Tin nhắn',
  DanhBa: 'Danh bạ',
  ThongBao: 'Thông báo',
  CaiDat: 'Cài đặt',
};
const icons: Record<keyof ChatTabs, ChatIconName> = {
  Home: 'message',
  DanhBa: 'users',
  ThongBao: 'bell',
  CaiDat: 'settings',
};

export const ThanhTab = ({ state, navigation, insets }: BottomTabBarProps) => {
  const { thongBao, troChuyen, hienThiBadge } = useChat();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (keyboardOpen) return null;
  const unread = thongBao.filter(item => !item.daDoc).length;
  const unreadMessages = troChuyen.reduce(
    (total, conversation) => total + conversation.soChuaDoc,
    0,
  );
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
    >
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const name = route.name as keyof ChatTabs;
          const selected = state.index === index;
          const badge = hienThiBadge
            ? name === 'Home'
              ? unreadMessages
              : name === 'ThongBao'
              ? unread
              : 0
            : 0;
          const onPress = () => {
            Keyboard.dismiss();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
              data: { behavior: { scrollToTop: true, popToTop: true } },
            });
            if (!selected && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              activeOpacity={0.65}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${labels[name]}${
                badge
                  ? `, ${badge} ${
                      name === 'Home' ? 'tin nhắn' : 'thông báo'
                    } chưa đọc`
                  : ''
              }`}
              style={[styles.tab, selected && styles.selected]}
            >
              <View>
                <BieuTuong
                  name={icons[name]}
                  size={22}
                  color={
                    selected ? theme.colors.primary : theme.colors.secondary
                  }
                />
                {badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badge > 99 ? '99+' : badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, selected && styles.selectedLabel]}>
                {labels[name]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
