import React, { useEffect } from 'react';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ItemsProvider } from '@/contexts/items.context';
import { BiometricsProvider, useBiometrics } from '@/contexts/biometrics.context';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
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


function BiometricLockGuard({ children }: { children: React.ReactNode }) {
  const { isBiometricEnabled, isUnlocked, promptUnlock } = useBiometrics();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  if (isBiometricEnabled && !isUnlocked) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
          padding: 24,
        }}>
        <Ionicons name="lock-closed" size={56} color={theme.primary} style={{ marginBottom: 16 }} />
        <ActivityIndicator size="small" color={theme.primary} style={{ marginBottom: 16 }} />
        <Button
          title="Unlock with Biometrics"
          variant="primary"
          onPress={() => promptUnlock()}
          style={{ width: '100%', maxWidth: 280 }}
        />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <AuthProvider>
      <BiometricsProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <BiometricLockGuard>
          <RootNavigation />
        </BiometricLockGuard>
      </BiometricsProvider>
    </AuthProvider>
  );
}
