import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}>
      <Stack.Screen name="login" options={{ title: 'Log In', headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account', headerShown: false }} />
    </Stack>
  );
}
