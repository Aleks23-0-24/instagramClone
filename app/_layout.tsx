import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const RootLayoutNav = () => {
  const { authState, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for the auth state to load

    const inTabsGroup = segments[0] === '(tabs)';

    // If the user is authenticated and not in the main app group,
    // redirect them to the main app group.
    if (authState?.authenticated && !inTabsGroup) {
      router.replace('/(tabs)');
    }
    // If the user is not authenticated and in the main app group,
    // redirect them to the login page.
    else if (!authState?.authenticated && inTabsGroup) {
      router.replace('/login');
    }
  }, [authState, loading, segments]);

  // While loading the auth state, you can show a loading indicator or a splash screen.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Create Account', presentation: 'modal' }} />
      </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}