import React, { forwardRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import { BieuTuong } from '../common';
import { themeChat as theme } from '../../styles/theme';
import { styles } from './styles';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  password?: boolean;
}
export type ONhapRef = React.ComponentRef<typeof TextInput>;
export const ONhap = forwardRef<ONhapRef, Props>(
  ({ label, error, password, style, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputWrap,
            focused && styles.focused,
            !!error && styles.invalid,
          ]}
        >
          <TextInput
            {...props}
            ref={ref}
            accessibilityLabel={label}
            accessibilityHint={error}
            placeholderTextColor={theme.colors.secondary}
            secureTextEntry={password ? !visible : props.secureTextEntry}
            style={[styles.input, style]}
            onFocus={event => {
              setFocused(true);
              props.onFocus?.(event);
            }}
            onBlur={event => {
              setFocused(false);
              props.onBlur?.(event);
            }}
          />
          {!!password && (
            <TouchableOpacity
              onPress={() => setVisible(current => !current)}
              activeOpacity={0.65}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <BieuTuong name={visible ? 'eyeOff' : 'eye'} size={22} />
            </TouchableOpacity>
          )}
        </View>
        {!!error && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);
ONhap.displayName = 'ONhapChat';
