import React, {forwardRef, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import {styles} from './styles';

export interface UduInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export type UduInputRef = React.ComponentRef<typeof TextInput>;

export const UduInput = forwardRef<UduInputRef, UduInputProps>(
  (
    {
      label,
      error,
      containerStyle,
      style,
      editable = true,
      onFocus,
      onBlur,
      accessibilityLabel,
      accessibilityHint,
      placeholderTextColor = '#94A3B8',
      ...props
    },
    ref,
  ) => {
    const [dangFocus, setDangFocus] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            dangFocus && styles.focused,
            !!error && styles.invalid,
            !editable && styles.disabled,
          ]}>
          <TextInput
            {...props}
            ref={ref}
            editable={editable}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={error || accessibilityHint}
            placeholderTextColor={placeholderTextColor}
            style={[styles.input, style]}
            onFocus={event => {
              setDangFocus(true);
              onFocus?.(event);
            }}
            onBlur={event => {
              setDangFocus(false);
              onBlur?.(event);
            }}
          />
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

UduInput.displayName = 'UduInput';

export default UduInput;
