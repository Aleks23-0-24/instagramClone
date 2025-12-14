import { useAuth } from '@/app/context/AuthContext';
import { getApiUrl } from '@/app/utils/runtimeConfig';
import Avatar from '@/components/Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatPage() {
  const { userId } = useLocalSearchParams() as { userId?: string };
  const router = useRouter();
  const { authState } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const flatRef = useRef<FlatList>(null as any);

  const fetchUser = async (id?: string) => {
    if (!id) return;
    try {
      const res = await axios.get(getApiUrl(`/users/${id}`));
      setOtherUser(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (id?: string) => {
    if (!id) return;
    try {
      const res = await axios.get(getApiUrl(`/chat/${id}/messages`));
      setMessages(res.data);
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!userId) return;
    let stopped = false;
    (async () => {
      setLoading(true);
      await fetchUser(userId);
      await fetchMessages(userId);
      setLoading(false);
      const t = setInterval(() => fetchMessages(userId), 2000);
      return () => { clearInterval(t); stopped = true; };
    })();
  }, [userId]);

  const send = async () => {
    if (!text.trim() || !userId) return;
    try {
      const res = await axios.post(getApiUrl(`/chat/${userId}/messages`), { content: text });
      setMessages(prev => [...prev, res.data]);
      setText('');
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) { console.error(e); }
  };

  const pickImageAndSend = async () => {
    if (!userId) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      const base64 = asset?.base64;
      if (!base64) return;
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      setUploadingImage(true);
      const res = await axios.post(getApiUrl(`/chat/${userId}/messages`), { content: dataUrl });
      setMessages(prev => [...prev, res.data]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) { console.error(e); } finally { setUploadingImage(false); }
  };

  const deleteMessage = async (messageId: string) => {
    if (!userId) return;
    try {
      await axios.delete(getApiUrl(`/chat/${userId}/messages/${messageId}`));
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) { console.error(e); }
  };

  if (loading) return <ThemedView style={{ flex:1, justifyContent:'center', alignItems:'center' }}><ActivityIndicator /></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ flexDirection:'row', alignItems:'center', marginLeft:12 }}>
          <Avatar uri={otherUser?.avatarUrl} name={otherUser?.username} size={48} />
          <ThemedText style={{ marginLeft:8 }}>{otherUser?.username}</ThemedText>
        </View>
      </View>

      <FlatList ref={flatRef} data={messages} keyExtractor={m => m.id} style={{ flex:1 }} renderItem={({ item: m }) => {
        const isSent = m.senderId === authState?.userId;
        const avatarM = m.sender?.avatarUrl || 'https://via.placeholder.com/36';
        const isImage = typeof m.content === 'string' && m.content.startsWith('data:image');
        return (
          <View style={[styles.messageContainer, isSent ? styles.messageContainerSent : styles.messageContainerReceived]}>
            {!isSent && (
              <TouchableOpacity onPress={() => router.push({ pathname: '/user', params: { userId: m.sender?.id } })}>
                <Image source={{ uri: avatarM }} style={styles.messageAvatar} />
              </TouchableOpacity>
            )}
            <View style={[styles.messageRow, isSent ? styles.messageSent : styles.messageReceived]}>
              {isImage ? <Image source={{ uri: m.content }} style={{ width: 180, height: 180, borderRadius: 8 }} /> : <ThemedText style={{color:'#fff'}}>{m.content}</ThemedText>}
              <ThemedText  type="default" style={styles.timestamp}>{new Date(m.createdAt).toLocaleTimeString()}</ThemedText>
            </View>
            {isSent && <Image source={{ uri: avatarM }} style={styles.messageAvatar} />}
            {isSent && (
              <TouchableOpacity onPress={() => deleteMessage(m.id)} style={{ marginLeft: 8 }}>
                <MaterialIcons name="delete" size={18} color="gray" />
              </TouchableOpacity>
            )}
          </View>
        );
      }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={pickImageAndSend} style={{ marginRight: 8 }}>
            <MaterialIcons name="image" size={24} color={uploadingImage ? 'gray' : 'gray'} />
          </TouchableOpacity>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message..." placeholderTextColor="#888" />
          <TouchableOpacity onPress={send} style={styles.sendBtn} disabled={uploadingImage}>
            <ThemedText style={{color:'#fff'}}>{uploadingImage ? 'Uploading...' : 'Send'}</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingTop:44 },
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:12, marginBottom:8 },
  messageRow: { padding:10, borderRadius:8, marginBottom:8, maxWidth:'80%' },
  messageSent: { alignSelf:'flex-end', backgroundColor:'#0a84ff' },
  messageReceived: { alignSelf:'flex-start', backgroundColor:'#2c2c2e' },
  timestamp: { fontSize:10, color:'#999', marginTop:4 },
  messageContainer: { flexDirection:'row', alignItems:'flex-end', marginBottom:8, paddingHorizontal:12 },
  messageContainerSent: { justifyContent:'flex-end' },
  messageContainerReceived: { justifyContent:'flex-start' },
  messageAvatar: { width:28, height:28, borderRadius:14, marginHorizontal:8 },
  inputRow: { flexDirection:'row', padding:8, borderTopWidth:1, borderTopColor:'#333', alignItems:'center' },
  input: { flex:1, padding:10, borderRadius:20, backgroundColor:'#212121ff', borderWidth:1,  color:'white', marginRight:8 },
  sendBtn: { paddingHorizontal:12, paddingVertical:8, backgroundColor:'#0a84ff',color:"#fff", borderRadius:16 },
});