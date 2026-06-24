import { useState, useEffect } from 'react'
import { Tabs, Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '@/hooks/useAuth'
import { COLORS } from '@/constants/colors'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { user, isLoading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem('onboarding-done').then(val => setOnboardingDone(val === '1'))
  }, [])

  if (isLoading || onboardingDone === null) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  }

  if (!user) {
    if (!onboardingDone) return <Redirect href="/onboarding" />
    return <Redirect href="/welcome" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Accueil',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="clients" options={{
        title: 'Clients',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="documents" options={{
        title: 'Documents',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
        ),
      }} />
    </Tabs>
  )
}
