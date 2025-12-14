import { Post, PostCard } from '@/components/PostCard';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { useCallback, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';

import { useAuth } from '@/app/context/AuthContext';

import { getApiUrl } from '@/app/utils/runtimeConfig';

export default function FeedScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const response = await axios.get(getApiUrl('/posts'));
            setPosts(response.data);
        } catch (error) {
            Alert.alert('Error', 'Could not fetch feed.');
        } finally {
            setLoading(false);
        }
    };

    // fetch once on mount; avoid refetch on screen focus to prevent unnecessary reloads (e.g., when returning from comments)
    useEffect(() => {
        fetchFeed();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            await axios.post(getApiUrl(`/posts/${postId}/like`));
            fetchFeed();
        } catch (error) {
            Alert.alert('Error', 'Could not update like.');
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={posts}
                renderItem={({ item }) => <PostCard post={item} onLike={handleLike} onDelete={() => fetchFeed()} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                onRefresh={fetchFeed}
                refreshing={loading}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 44,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 10,
    },
});