import { View, TextInput, StyleSheet, Alert } from 'react-native';
import ThemedButton from '@/components/ThemedButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { onRegister } = useAuth();
    const router = useRouter();
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'icon');
    const placeholderColor = useThemeColor({}, 'icon');

    const handleRegister = async () => {
        const result = await onRegister!(email, username, password);
        if (result && result.error) {
            Alert.alert('Registration Failed', result.msg);
        } else {
            Alert.alert('Success', 'You can now log in.');
            router.push('/login');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Register</ThemedText>
            <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Email"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Username"
                placeholderTextColor={placeholderColor}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <ThemedButton title="Register" onPress={handleRegister} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        width: '100%',
        height: 40,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,

    },
});
