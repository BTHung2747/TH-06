import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatIcons, type ChatIconName } from '../assets/icons';
import { themeChat as theme } from '../styles/theme';

export const BieuTuong = ({
  name,
  color = theme.colors.secondary,
  size = 24,
}: {
  name: ChatIconName;
  color?: string;
  size?: number;
}) => (
  <Image
    source={chatIcons[name]}
    style={{ width: size, height: size, tintColor: color }}
    resizeMode="contain"
    accessible={false}
  />
);

export const TieuDeManHinh = ({
  title,
  subtitle,
  eyebrow = 'UDU CHAT',
  onProfile,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onProfile?: () => void;
}) => (
  <View style={styles.header}>
    <View style={styles.headerCopy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {!!onProfile && (
      <TouchableOpacity
        onPress={onProfile}
        activeOpacity={0.65}
        style={styles.profileButton}
        accessibilityRole="button"
        accessibilityLabel="Mở cài đặt tài khoản"
      >
        <BieuTuong name="user" color={theme.colors.primary} />
      </TouchableOpacity>
    )}
  </View>
);

export const TrangRong = ({
  title,
  subtitle,
  icon = 'message',
}: {
  title: string;
  subtitle?: string;
  icon?: ChatIconName;
}) => (
  <View style={styles.empty} accessibilityLiveRegion="polite">
    <View style={styles.emptyIcon}>
      <BieuTuong name={icon} size={28} color={theme.colors.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {!!subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 13, color: theme.colors.secondary, marginBottom: 6 },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 6,
    lineHeight: 21,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingHorizontal: 28,
    paddingVertical: 44,
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: theme.colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.colors.secondary,
  },
});
