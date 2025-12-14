import { useAuth } from '@/app/context/AuthContext';
import { getApiUrl } from '@/app/utils/runtimeConfig';
import Avatar from '@/components/Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CommentsPage() {
  const { postId } = useLocalSearchParams() as { postId: string };
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    try {
      const res = await axios.get(getApiUrl(`/posts/${postId}/comments`));
      setComments(res.data);
    } catch (e) { console.error(e); }
  };
const textColorSend = useThemeColor(
  { light: '#fff', dark: '#000' },
  'text'
);
  useEffect(() => { if (postId) fetchComments(); }, [postId]);

  const { authState } = useAuth();

  const submitComment = async () => {
    if (!text.trim()) return;
    if (!authState?.authenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await axios.post(getApiUrl(`/posts/${postId}/comments`), { content: text });
      setComments(prev => [...prev, res.data]);
      setText('');
    } catch (e) { console.error(e); }
  };

  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({ light: '#f1f1f1', dark: '#1e1e1e' }, 'background');
  const placeholderColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        data={comments}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <TouchableOpacity onPress={() => router.push(`/user?userId=${item.author.id}`)}>
              <Avatar uri={item.author.avatarUrl} name={item.author.username} size={32} />
            </TouchableOpacity>
            <View style={{ marginLeft: 8 }}>
              <ThemedText style={{ fontWeight: 'bold' }}>{item.author.username}</ThemedText>
              <ThemedText>{item.content}</ThemedText>
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={text} onChangeText={setText} placeholder="Write a comment..." placeholderTextColor={placeholderColor} />
        <TouchableOpacity onPress={submitComment} style={[styles.sendButton, { backgroundColor: tint }]}>
          <ThemedText style={{ color: textColorSend }}>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44, padding: 12 },
  commentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 0, borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { padding: 8, borderRadius: 8 },
});