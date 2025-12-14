import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, TextInput, View } from 'react-native';
import ThemedButton from '@/components/ThemedButton';

import { getApiUrl } from '@/app/utils/runtimeConfig';
import { useAuth } from '@/app/context/AuthContext';


export default function UploadScreen() {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const router = useRouter();
    const { authState } = useAuth();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Please select an image first');
            return;
        }

        const formData = new FormData();
        formData.append('description', description);
        // Handle image upload differently for web vs native
        if (Platform.OS === 'web') {
            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            formData.append('image', file);
        } else {
            // For native, the URI is enough for FormData
            formData.append('image', {
                uri: image,
                name: `photo.jpg`,
                type: `image/jpeg`,
            } as any);
        }

        try {
            if (!authState?.authenticated) { router.push('/login'); return; }
            await axios.post(getApiUrl('/posts'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Success', 'Post uploaded!');
            setImage(null);
            setDescription('');
            router.push('/');
        } catch (error) {
            console.error(error);
            Alert.alert('Upload failed', 'Please try again.');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Create Post</ThemedText>

            <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                    <ThemedButton title="Pick image" onPress={pickImage} />
                </View>
                <View style={styles.buttonWrapper}>
                    <ThemedButton title="Upload" onPress={handleUpload} />
                </View>
            </View>

            {image && <Image source={{ uri: image }} style={styles.image} />}

            <TextInput
                style={styles.input}
                placeholder="Write a description..."
                value={description}
                onChangeText={setDescription}
                multiline
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 44,
        paddingHorizontal: 20,
    },
    title: {
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 6,
    },
    image: {
        width: '100%',
        height: 300,
        marginVertical: 12,
        borderRadius: 8,
    },
    input: {
        width: '100%',
        minHeight: 80,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        textAlignVertical: 'top',
    },
});
