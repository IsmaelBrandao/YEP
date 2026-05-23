import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppDataProvider } from '../src/hooks/AppDataContext';
import { AuthProvider } from '../src/hooks/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="station/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </AppDataProvider>
    </AuthProvider>
  );
}
