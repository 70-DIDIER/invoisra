import { Stack } from 'expo-router'
import { AuthProvider } from '@/hooks/useAuth'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="clients/new" />
        <Stack.Screen name="clients/[id]" />
        <Stack.Screen name="documents/new" />
        <Stack.Screen name="documents/new-lignes" />
        <Stack.Screen name="documents/new-frais" />
        <Stack.Screen name="documents/[id]" />
        <Stack.Screen name="document/pdf" />
        <Stack.Screen name="document/share" />
        <Stack.Screen name="pdf-templates" />
        <Stack.Screen name="company/edit" />
      </Stack>
    </AuthProvider>
  )
}
