import { Stack } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { AuthProvider } from '@/hooks/useAuth'

WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="clients/new" />
        <Stack.Screen name="clients/[id]" />
        <Stack.Screen name="documents/new" />
        <Stack.Screen name="documents/new-lignes" />
        <Stack.Screen name="documents/new-frais" />
        <Stack.Screen name="document/pdf" />
        <Stack.Screen name="pdf-templates" />
        <Stack.Screen name="company/edit" />
      </Stack>
    </AuthProvider>
  )
}
