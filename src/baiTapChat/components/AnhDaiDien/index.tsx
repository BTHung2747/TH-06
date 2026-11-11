import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';
import { styles } from './styles';

export const AnhDaiDien = ({
  source,
  size = 48,
  online = false,
  muted = false,
}: {
  source: ImageSourcePropType;
  size?: number;
  online?: boolean;
  muted?: boolean;
}) => (
  <View
    style={[
      styles.avatar,
      muted && styles.muted,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessible={false}
    />
    {online && <View style={styles.onlineDot} />}
  </View>
);
