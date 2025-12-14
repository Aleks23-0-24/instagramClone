import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { GestureResponderEvent, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export default function ThemedButton({ title, onPress, disabled, style, textStyle }: Props) {
  const tint = useThemeColor({}, 'tint');
  const bg = tint;
  const disabledBg = useThemeColor({ light: '#e0e0e0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#fff', dark: '#000' }, 'background');

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.button, { backgroundColor: disabled ? disabledBg : bg, opacity: disabled ? 0.75 : 1 }, style]}>
      <ThemedText type="defaultSemiBold" style={[{ color: textColor, textAlign: 'center' }, textStyle]}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
