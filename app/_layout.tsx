import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const RootLayoutNav = () => {
  const { authState, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [runtimeReady, setRuntimeReady] = React.useState(false);

  useEffect(() => {
    if (loading) return; // Wait for the auth state to load

    const inTabsGroup = segments[0] === '(tabs)';

    // Allow specific standalone routes (comments, chat, user, login, register) to be reachable
    const allowedStandalone = new Set(['comments', 'chat', 'user', 'login', 'register', 'followers']);
    const currentSegment = segments[0] || '';

    // If the user is authenticated and not in the main app group,
    // redirect them to the main app group only when they are at root or an unknown route.
    if (authState?.authenticated && !inTabsGroup && !allowedStandalone.has(currentSegment)) {
      router.replace('/(tabs)');
    }
    // If the user is not authenticated and in the main app group,
    // redirect them to the login page.
    else if (!authState?.authenticated && inTabsGroup) {
      router.replace('/login');
    }
  }, [authState?.authenticated, loading, segments]);

  useEffect(() => {
    (async () => {
      const { initRuntimeConfig } = await import('@/app/utils/runtimeConfig');
      await initRuntimeConfig();
      setRuntimeReady(true);
    })();
  }, []);

  // While loading the auth state or runtime config, show a loading indicator or a splash screen.
  if (loading || !runtimeReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const screenHeaderOptions = {
    headerStyle: { backgroundColor: themeColors.background },
    headerTitleStyle: { color: themeColors.text },
    headerTintColor: themeColors.tint,
  };

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Create Account', presentation: 'modal', ...screenHeaderOptions }} />
        <Stack.Screen name="followers" options={{ title: 'Followers', ...screenHeaderOptions }} />
        <Stack.Screen name="chat" options={{ title: 'Chat', ...screenHeaderOptions }} />
        <Stack.Screen name="comments" options={{ title: 'Comments', ...screenHeaderOptions }} />
        <Stack.Screen name="user" options={{ title: 'User Profile', ...screenHeaderOptions }} />
      </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}