import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import Avatar from '@/components/Avatar';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiUrl } from '@/app/utils/runtimeConfig';
import { useAuth } from '@/app/context/AuthContext';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function FollowersPage() {
  const { userId, tab } = useLocalSearchParams() as { userId?: string; tab?: 'followers' | 'following' };
  const router = useRouter();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [myFollowing, setMyFollowing] = useState<string[]>([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: tab === 'following' ? 'Following' : 'Followers' });
  }, [tab]);

  const loadMyFollowing = useCallback(async () => {
    try {
      if (!authState.userId) return;
      const res = await axios.get(getApiUrl(`/users/${authState.userId}/following`), { headers: { 'Cache-Control': 'no-cache' } });
      const followingList = res.data || [];
      setMyFollowing(followingList.map((u: any) => u.id));
    } catch (e) { console.error(e); }
  }, [authState.userId]);

  const fetchUsers = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const endpoint = tab === 'following' ? `/users/${userId}/following` : `/users/${userId}/followers`;
      const res = await axios.get(getApiUrl(endpoint), { headers: { 'Cache-Control': 'no-cache' } });
      setList(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId, tab]);

  useEffect(() => {
    if (isFocused) {
        loadMyFollowing();
        fetchUsers();
    }
  }, [isFocused, loadMyFollowing, fetchUsers]);

  const toggleFollow = async (targetId: string) => {
    if (!authState.userId) { router.push('/login'); return; }
    try {
      await axios.post(getApiUrl(`/users/${targetId}/follow`));
      await loadMyFollowing(); // refetch my following list
      await fetchUsers(); // refetch users to update the list
    } catch (e) { console.error(e); }
  };

  if (loading) return <ThemedView style={{ flex:1, justifyContent:'center', alignItems:'center' }}><ActivityIndicator /></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push({ pathname: '/user', params: { userId: item.id } })}>
            <Avatar uri={item.avatarUrl} name={item.username} size={48} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ fontWeight: 'bold' }}>{item.username}</ThemedText>
            </View>
            {authState.userId !== item.id && (
              <TouchableOpacity onPress={() => toggleFollow(item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: myFollowing.includes(item.id) ? '#444' : '#0a84ff', borderRadius: 8 }}>
                <ThemedText>{myFollowing.includes(item.id) ? 'Following' : 'Follow'}</ThemedText>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
});
