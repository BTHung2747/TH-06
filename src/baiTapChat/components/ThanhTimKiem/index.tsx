import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { BieuTuong } from '../common';
import { themeChat as theme } from '../../styles/theme';
import { styles } from './styles';
export const ThanhTimKiem = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) => (
  <View style={styles.container}>
    <BieuTuong name="search" size={20} />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      accessibilityLabel={placeholder}
      placeholderTextColor={theme.colors.secondary}
      style={styles.input}
      returnKeyType="search"
      autoCorrect={false}
    />
    {!!value && (
      <TouchableOpacity
        onPress={() => onChange('')}
        accessibilityRole="button"
        accessibilityLabel="Xóa từ khóa tìm kiếm"
        style={styles.clearButton}
      >
        <BieuTuong name="close" size={18} />
      </TouchableOpacity>
    )}
  </View>
);
