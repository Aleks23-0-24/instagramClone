import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import axios from 'axios';
import { useRouter } from 'expo-router';
import API_URL from '../../config';
import { useAuth } from '@/app/context/AuthContext';

export default function ChatsScreen() {
  const { authState } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/chat/users`);
      const all = res.data.filter((u: any) => u.id && u.id !== authState.userId);
      setUsers(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const avatar = item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || 'User')}&background=444&color=fff&size=128`;
          return (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/conversation?userId=${item.id}`)}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
              <View style={styles.info}>
                <ThemedText>{item.username}</ThemedText>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  info: { flex: 1 },
});
