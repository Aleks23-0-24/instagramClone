import React, { useState } from 'react';
import { View, Image, ActivityIndicator, TouchableOpacity, StyleSheet, ImageStyle } from 'react-native';

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  onPress?: () => void;
  style?: ImageStyle;
};


export const Avatar = ({ uri, name, size = 40, onPress, style }: AvatarProps) => {
  const [error, setError] = useState(false);
  const fallbackName = name ? encodeURIComponent(name) : 'User';
  const source = uri && !error ? { uri } : { uri: `https://ui-avatars.com/api/?name=${fallbackName}&background=888&color=fff&size=${Math.max(32, size)}` };

  const img = (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#444', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        onError={() => setError(true)}
        resizeMode="cover"
      />
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress}>{img}</TouchableOpacity>;
  return img;
};

export default Avatar;
