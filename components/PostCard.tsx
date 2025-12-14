import { useAuth } from '@/app/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from './Avatar';
import { ThemedText } from './themed-text';

import { getApiUrl } from '@/app/utils/runtimeConfig';

export type Post = {
    id: string;
    imageUrl: string;
    description: string | null;
    author: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    likes: { userId: string }[];
    _count: {
        comments: number;
    };
};

type PostCardProps = { post: Post, onLike: (postId: string) => void, onDelete?: (postId: string) => void };

export const PostCard = ({ post, onLike, onDelete }: PostCardProps) => {
    const { authState } = useAuth();
    const router = useRouter();
    const isLiked = post.likes.some(like => like.userId === authState?.userId);

    const [imageLoading, setImageLoading] = useState(false);
    const [commentText, setCommentText] = useState('');

    const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
    const textColor = useThemeColor({}, 'text');
    const muted = useThemeColor({}, 'icon');
    const tint = useThemeColor({}, 'tint');
    const inputBg = useThemeColor({ light: '#f9f9f9', dark: '#121212' }, 'background');

    const handleLike = () => {
        if (!authState?.authenticated) {
            router.push('/login');
            return;
        }
        onLike(post.id);
    };

    const handleDelete = async () => {
        try {
            console.log('Requesting delete for post', post.id);
            const res = await axios.delete(getApiUrl(`/posts/${post.id}`));
            console.log('Delete response', res && res.status, res && res.data);
            if (onDelete) onDelete(post.id);
        } catch (e) {
            console.error('Error deleting post', post.id, e);
        }
    };

    const confirmDelete = () => {
        Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ]);
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;
        // simple optimistic UI - try to send but don't block navigation
        const temp = commentText;
        setCommentText('');
        try {
            await axios.post(getApiUrl(`/posts/${post.id}/comments`), { content: temp });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push(`/user?userId=${post.author.id}`)}>
                  <Avatar uri={post.author.avatarUrl || undefined} name={post.author.username} size={40} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/user?userId=${post.author.id}`)}>
                  <ThemedText style={styles.username}>{post.author.username}</ThemedText>
                </TouchableOpacity>
                {authState?.userId === post.author.id && (
                    <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
                        <MaterialIcons name="delete" size={22} color={muted} />
                    </TouchableOpacity>
                )}
            </View>
            {post.imageUrl ? (
                <View style={styles.image}>
                  {imageLoading && <ActivityIndicator style={{ position: 'absolute', alignSelf: 'center', top: '50%' }} />}
                  <Image source={{ uri: post.imageUrl }} style={styles.image} onLoadStart={() => setImageLoading(true)} onLoadEnd={() => setImageLoading(false)} />
                </View>
            ) : (
                <View style={[styles.image, styles.placeholder]} />
            )}
            <View style={styles.content}>
                <ThemedText style={styles.description}>{post.description}</ThemedText>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                    <MaterialIcons name={isLiked ? "favorite" : "favorite-border"} size={24} color={isLiked ? "red" : muted} />
                    <Text style={[styles.actionText, { color: muted }]}>{post.likes.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push({ pathname: '/comments', params: { postId: post.id } })} style={styles.actionButton}>
                    <MaterialIcons name="comment" size={24} color={muted} />
                    <Text style={[styles.actionText, { color: muted }]}>{post._count.comments}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        marginLeft:10
    },
    image: {
        width: '100%',
        height: 400,
    },
    content: {
        padding: 10,
    },
    description: {},
    actions: {
        flexDirection: 'row',
        padding: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 5,
        color: 'gray',
    },
    deleteButton: {
        marginLeft: 'auto',
        padding: 6,
    },
    commentsSection: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    comment: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    commentContent: {
        flex: 1,
    },
    commentAuthor: {
        fontWeight: 'bold',
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
    },
    sendButton: {
        padding: 8,
        borderRadius: 8,
    },
});