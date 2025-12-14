import { View, TextInput, StyleSheet, Alert } from 'react-native';
import ThemedButton from '@/components/ThemedButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { Link } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onLogin } = useAuth();

    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'icon');
    const placeholderColor = useThemeColor({}, 'icon');
    const tint = useThemeColor({}, 'tint');

    const handleLogin = async () => {
        const result = await onLogin!(email, password);
        if (result && result.error) {
            Alert.alert('Login Failed', result.msg);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Login</ThemedText>
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
                placeholder="Password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <ThemedButton title="Login" onPress={handleLogin} />
            <Link href="/register" style={[styles.link, { color: tint }]}>Don't have an account? Register</Link>
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
    link: {
        marginTop: 20,

    },
});
