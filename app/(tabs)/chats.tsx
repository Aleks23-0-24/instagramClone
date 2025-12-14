import React, { useEffect, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, Image, StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { getApiUrl } from '@/app/utils/runtimeConfig';
import { useAuth } from '@/app/context/AuthContext';

export default function ChatsScreen() {
  const { authState } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const flatRef = useRef<FlatList>(null as any);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/chat/users'));
      const all = res.data.filter((u: any) => u.id && u.id !== authState.userId);
      setUsers(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      const res = await axios.get(getApiUrl(`/users/${userId}`));
      setOtherUser(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await axios.get(getApiUrl(`/chat/${userId}/messages`));
      setMessages(res.data);
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    fetchMessages(activeUser);
    fetchUser(activeUser);
    const t = setInterval(() => fetchMessages(activeUser), 2000);
    return () => clearInterval(t);
  }, [activeUser]);

  const openChat = (id: string) => {
    // Navigate to dedicated chat screen
    router.push({ pathname: '/chat', params: { userId: id } });
  };

  const send = async () => {
    if (!text.trim() || !activeUser) return;
    try {
      const res = await axios.post(getApiUrl(`/chat/${activeUser}/messages`), { content: text });
      setMessages(prev => [...prev, res.data]);
      setText('');
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error(e);
    }
  };

  const pickImageAndSend = async () => {
    if (!activeUser) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      const base64 = asset?.base64;
      if (!base64) return;
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      setUploadingImage(true);
      const res = await axios.post(getApiUrl(`/chat/${activeUser}/messages`), { content: dataUrl });
      setMessages(prev => [...prev, res.data]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeUser) return;
    try {
      await axios.delete(getApiUrl(`/chat/${activeUser}/messages/${messageId}`));
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <ThemedView style={styles.container}><ActivityIndicator /></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const avatar = item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || 'User')}&background=444&color=fff&size=128`;
          return (
            <View>
              <TouchableOpacity style={styles.row} onPress={() => openChat(item.id)}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/user', params: { userId: item.id } })}>
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                </TouchableOpacity>
                <View style={styles.info}>
                  <ThemedText>{item.username}</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  info: { flex: 1 },
  chatPanel: { padding: 8, backgroundColor: '#111', marginBottom: 12 },
  list: { padding: 12, paddingBottom: 90 },
  messageRow: { padding: 10, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  messageSent: { alignSelf: 'flex-end', backgroundColor: '#0a84ff' },
  messageReceived: { alignSelf: 'flex-start', backgroundColor: '#2c2c2e' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  messageContainerSent: { justifyContent: 'flex-end' },
  messageContainerReceived: { justifyContent: 'flex-start' },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 8 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center' },
  input: { flex: 1, padding: 10, borderRadius: 20, backgroundColor: '#1e1e1e', color: 'white', marginRight: 8 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0a84ff', borderRadius: 16 },
});

