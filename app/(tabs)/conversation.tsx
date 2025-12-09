import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/app/context/AuthContext';
import API_URL from '../../config';

export default function ConversationScreen() {
  const { authState } = useAuth();
  const { userId } = useLocalSearchParams() as { userId: string };
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const flatRef = useRef<FlatList>(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      setOtherUser(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/chat/${userId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUser();
    fetchMessages();
    const t = setInterval(fetchMessages, 2000);
    return () => clearInterval(t);
  }, [userId]);

  const send = async () => {
    if (!text.trim() || !userId) return;
    try {
      const res = await axios.post(`${API_URL}/chat/${userId}/messages`, { content: text });
      setMessages(prev => [...prev, res.data]);
      setText('');
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        {otherUser && (
          <>
            <Image source={{ uri: otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.username||'User')}&background=444&color=fff&size=128` }} style={styles.otherAvatar} />
            <ThemedText style={{ flex: 1 }}>{otherUser.username}</ThemedText>
            
          </>
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSent = item.senderId === authState?.userId;
          const avatar = item.sender?.avatarUrl || 'https://via.placeholder.com/36';
          return (
            <View style={[styles.messageContainer, isSent ? styles.messageContainerSent : styles.messageContainerReceived]}>
              {!isSent && <Image source={{ uri: avatar }} style={styles.messageAvatar} />}
              <View style={[styles.messageRow, isSent ? styles.messageSent : styles.messageReceived]}>
                <ThemedText>{item.content}</ThemedText>
                <ThemedText type="default" style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString()}</ThemedText>
              </View>
              {isSent && <Image source={{ uri: avatar }} style={styles.messageAvatar} />}
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message..." placeholderTextColor="#888" />
          <TouchableOpacity onPress={send} style={styles.sendBtn}>
            <ThemedText>Send</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  otherAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  list: { padding: 12, paddingBottom: 90 },
  messageRow: { padding: 10, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  messageSent: { alignSelf: 'flex-end', backgroundColor: '#0a84ff' },
  messageReceived: { alignSelf: 'flex-start', backgroundColor: '#2c2c2e' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  messageContainerSent: { justifyContent: 'flex-end' },
  messageContainerReceived: { justifyContent: 'flex-start' },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 8 },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 8, padding: 6 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center' },
  input: { flex: 1, padding: 10, borderRadius: 20, backgroundColor: '#1e1e1e', color: 'white', marginRight: 8 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0a84ff', borderRadius: 16 },
});
