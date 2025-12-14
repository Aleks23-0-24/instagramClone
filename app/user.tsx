import { useAuth } from '@/app/context/AuthContext';
import { getApiUrl, safeGetItem, safeSetItem } from '@/app/utils/runtimeConfig';
import Avatar from '@/components/Avatar';
import { PostCard } from '@/components/PostCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function UserPage() {
  const { userId } = useLocalSearchParams() as { userId?: string };
  const { authState } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (id?: string) => {
    if (!id) return;
    try {
      const res = await axios.get(getApiUrl(`/users/${id}`));
      setUser(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async (id?: string) => {
    if (!id) return;
    try {
      const res = await axios.get(getApiUrl('/posts'));
      const userPosts = res.data.filter((p: any) => p.author?.id === id);
      setPosts(userPosts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const key = `following_${authState.userId}`;
        const raw = await safeGetItem(key);
        const list = raw ? JSON.parse(raw) : [];
        setIsFollowing(list.includes(userId));
      } catch (e) { /* ignore */ }
    })();
  }, [userId]);

  const toggleFollow = async () => {
    try {
      const key = `following_${authState.userId}`;
      const raw = await safeGetItem(key);
      const list = raw ? JSON.parse(raw) : [];
      // call backend to toggle follow (keeps server state in sync)
      try {
        await axios.post(getApiUrl(`/users/${userId}/follow`));
      } catch (e) {
        console.error('Failed to toggle follow on server', e);
      }
      if (isFollowing) {
        const next = list.filter((id: string) => id !== userId);
        await safeSetItem(key, JSON.stringify(next));
        setIsFollowing(false);
      } else {
        const next = [...list, userId];
        await safeSetItem(key, JSON.stringify(next));
        setIsFollowing(true);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUser(userId);
    fetchPosts(userId);
  }, [userId]);

  if (loading) return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={user?.avatarUrl} name={user?.username} size={96} />
        <ThemedText type="title" style={styles.username}>{user?.username}</ThemedText>
        {userId !== authState.userId && (
          <TouchableOpacity style={{ marginTop: 8 }} onPress={toggleFollow}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isFollowing ? '#444' : '#0a84ff', borderRadius: 8, }}>
              <ThemedText style={{color:'white'}}>{isFollowing ? 'Unfollow' : 'Follow'}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ThemedText type="subtitle" style={styles.section}>Publications</ThemedText>
      {posts.length === 0 ? (
        <ThemedText>No posts yet.</ThemedText>
      ) : (
        <FlatList
          style={styles.list}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onLike={async (postId) => { try { await axios.post(getApiUrl(`/posts/${postId}/like`)); } catch(e){console.error(e);} }} onDelete={() => fetchPosts(userId)} />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44, paddingHorizontal: 20 },
  center: { flex:1, alignItems:'center', justifyContent:'center' },
  header: { alignItems:'center', marginBottom: 12 },
  avatar: { width: 96, height:96, borderRadius: 48, marginBottom:8 },
  avatarPlaceholder: { width:96, height:96, borderRadius:48, backgroundColor:'#666', alignItems:'center', justifyContent:'center', marginBottom:8 },
  username: { marginBottom: 8, textAlign:'center' },
  section: { marginTop:12, marginBottom:8 },
  list: { flex:1 },
});