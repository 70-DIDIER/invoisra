import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

interface Props {
  url: string
  visible: boolean
  onSuccess: (url: string) => void
  onError: (error: string) => void
  onClose: () => void
}

export default function GoogleAuthBrowser({ url, visible, onError, onClose }: Props) {
  const [message, setMessage] = useState('Ouverture du navigateur...')

  useEffect(() => {
    if (!visible || !url) return

    setMessage('Redirection vers Google...')

    const timer = setTimeout(async () => {
      console.log('[GoogleAuth] Opening browser...')
      try {
        const result = await WebBrowser.openAuthSessionAsync(url, 'invoica://auth/callback')
        console.log('[GoogleAuth] Browser result type:', result.type)
        if (result.type === 'success' && result.url) {
          console.log('[GoogleAuth] Success URL:', result.url.substring(0, 120))
          onSuccess(result.url)
        } else {
          console.log('[GoogleAuth] Browser dismissed or cancelled')
          onError('Authentification annulée')
        }
      } catch (err: any) {
        console.log('[GoogleAuth] Browser error:', err.message)
        onError(err.message || 'Erreur navigateur')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [visible, url])

  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#0E7D36" />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  text: { marginTop: 16, fontSize: 15, color: '#0E7D36', fontWeight: '600' },
})
