import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { COLORS } from '@/constants/colors'
import { StatusBar } from 'expo-status-bar'

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams()
  const [error, setError] = useState('')
  const { saveAuth } = useAuth()

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      let token = (params.token as string) || ''
      let userJson = (params.user as string) || ''
      let code = (params.code as string) || ''

      if (!token && !code) {
        const url = await Linking.getInitialURL()
        if (url) {
          const parsed = Linking.parse(url)
          token = (parsed.queryParams as any)?.token || ''
          userJson = (parsed.queryParams as any)?.user || ''
          code = (parsed.queryParams as any)?.code || ''
        }
      }

      if (token && userJson) {
        const user = JSON.parse(decodeURIComponent(userJson))
        await saveAuth(token, user)
        router.replace('/')
        return
      }

      if (code) {
        const response = await api.get('/auth/google/callback', { params: { code } })
        const data = response.data
        await saveAuth(data.token, data.user)
        router.replace('/')
        return
      }

      setError('Aucun token ou code trouvé')
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification")
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
      <StatusBar style="dark" />
      {error ? (
        <>
          <Text style={{ color: COLORS.danger, fontSize: 16, marginBottom: 12 }}>{error}</Text>
          <Text style={{ color: COLORS.primary, fontSize: 14 }} onPress={() => router.replace('/login')}>
            Retour à la connexion
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, fontSize: 15, color: COLORS.primary }}>Authentification en cours...</Text>
        </>
      )}
    </View>
  )
}
