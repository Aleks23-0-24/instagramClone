import { useAuth } from '@/app/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import ThemedButton from '@/components/ThemedButton';

import { getApiUrl } from '@/app/utils/runtimeConfig';

import { PostCard } from '@/components/PostCard';
import Avatar from '@/components/Avatar';


export default function ProfileScreen() {
  const { onLogout, authState } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleLogout = async () => {
    await onLogout!();
    router.replace('/login');
  };

  const { userId: paramUserId } = useLocalSearchParams() as { userId?: string };
  const currentUid = paramUserId || authState.userId;

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl(`/posts/user/${currentUid}`), { headers: { 'Cache-Control': 'no-cache' } });
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [currentUid]);

  const [user, setUser] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    try {
      const id = currentUid;
      if (!id) return;
      const res = await axios.get(getApiUrl(`/users/${id}`), { headers: { 'Cache-Control': 'no-cache' } });
      setUser(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [currentUid]);

  // compute followers/following counts
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const computeCounts = useCallback(async () => {
    try {
      const id = currentUid;
      if (!id) return;
      const [followersRes, followingRes] = await Promise.all([
        axios.get(getApiUrl(`/users/${id}/followers`), { headers: { 'Cache-Control': 'no-cache' } }),
        axios.get(getApiUrl(`/users/${id}/following`), { headers: { 'Cache-Control': 'no-cache' } }),
      ]);
      setFollowersCount(followersRes.data.length);
      setFollowingCount(followingRes.data.length);
    } catch (e) {
      console.error(e);
    }
  }, [currentUid]);

  useEffect(() => {
    const loadData = async () => {
      if (currentUid) {
        setLoading(true);
        try {
          await Promise.all([
            fetchPosts(),
            fetchUser(),
            computeCounts()
          ]);
        } catch (error) {
          console.error("Failed to load data", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isFocused) {
      loadData();
    }
  }, [isFocused, currentUid, fetchPosts, fetchUser, computeCounts]);

  const avatarUrl = user?.avatarUrl;
  const username = user?.username || 'User';

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!authState.userId || !currentUid) return;
        const res = await axios.get(getApiUrl(`/users/${authState.userId}/following`), { headers: { 'Cache-Control': 'no-cache' } });
        const followingList = res.data || [];
        setIsFollowing(followingList.some((u: any) => u.id === currentUid));
      } catch (e) { /* ignore */ }
    })();
  }, [currentUid, authState.userId]);

  const toggleFollow = async () => {
    try {
      await axios.post(getApiUrl(`/users/${currentUid}/follow`));
      setIsFollowing(!isFollowing);
      computeCounts(); // re-fetch counts
    } catch (e) { console.error(e); }
  };

  const pickAvatar = async () => {
    if (currentUid !== authState.userId) return; // only allow changing own avatar
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;
    const uri = result.assets[0].uri;

    const formData = new FormData();
    if (Platform.OS === 'web') {
      const r = await fetch(uri);
      const blob = await r.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      formData.append('avatar', file);
    } else {
      formData.append('avatar', {
        uri,
        name: `avatar.jpg`,
        type: `image/jpeg`,
      } as any);
    }

    try {
      setUploadingAvatar(true);
      await axios.put(getApiUrl('/users/avatar'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // refresh posts/user info
      await fetchPosts(currentUid);
      await fetchUser(currentUid);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={avatarUrl} name={username} size={96} />
        <ThemedText type="title" style={styles.username}>{username}</ThemedText>

        {currentUid !== authState.userId && (
          <TouchableOpacity style={{ marginTop: 8 }} onPress={toggleFollow}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isFollowing ? '#444' : '#0a84ff', borderRadius: 8 }}>
              <ThemedText>{isFollowing ? 'Unfollow' : 'Follow'}</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {currentUid === authState.userId && (
          <View style={styles.logout}>
            <ThemedButton title={uploadingAvatar ? 'Uploading...' : 'Change Avatar'} onPress={pickAvatar} disabled={uploadingAvatar} />
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          <TouchableOpacity style={{ marginHorizontal: 12, alignItems: 'center' }} onPress={() => router.push({ pathname: '/followers', params: { userId: currentUid, tab: 'followers' } })}>
            <ThemedText type="title">{typeof followersCount === 'number' ? followersCount : '-'}</ThemedText>
            <ThemedText>Followers</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 12, alignItems: 'center' }} onPress={() => router.push({ pathname: '/followers', params: { userId: currentUid, tab: 'following' } })}>
            <ThemedText type="title">{typeof followingCount === 'number' ? followingCount : '-'}</ThemedText>
            <ThemedText>Following</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.logout}>
          <ThemedButton title="Logout" onPress={handleLogout} />
        </View>
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
            <PostCard
              post={item}
              onLike={async (postId) => {
                try {
                  await axios.post(getApiUrl(`/posts/${postId}/like`));
                } catch (e) {
                  console.error(e);
                } finally {
                  fetchPosts();
                }
              }}
              onDelete={() => fetchPosts()}
            />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
    paddingHorizontal: 20,
  },
  center: {
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  header: {
    alignItems:'center',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height:96,
    borderRadius: 48,
    marginBottom:8,
  },
  avatarPlaceholder: {
    width:96,
    height:96,
    borderRadius:48,
    backgroundColor:'#666',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:8,
  },
  username: {
    marginBottom: 8,
    textAlign:'center',
  },
  logout: {
    marginVertical:8,
    alignSelf:'center',
  },
  section: {
    marginTop:12,
    marginBottom:8,
  },
  list: {
    flex:1,
  },
  post: {
    marginBottom:16,
    borderRadius:8,
    overflow:'hidden',
  },
  postImage: {
    width:'100%',
    height:200,
  },
  postDesc: {
    marginTop:8,
  },
  postMeta: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 6,
    color: 'gray',
  },
});