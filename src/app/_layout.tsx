import React, { useEffect } from 'react';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ItemsProvider } from '@/contexts/items.context';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/(auth)/login' as Href);
    } else if (session && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      router.replace('/');
    }
  }, [session, isLoading, segments, router]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ItemsProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="item/new"
          options={{
            title: 'New Item',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{
            title: 'Item Details',
          }}
        />
        <Stack.Screen
          name="item/[id]/edit"
          options={{
            title: 'Edit Item',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ItemsProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <AuthProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigation />
    </AuthProvider>
  );
}
