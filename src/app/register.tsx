import { useState } from 'react'
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import GoogleAuthBrowser from '@/components/ui/GoogleAuthWebView'

export default function RegisterScreen() {
  const { register, googleLogin, handleGoogleCallbackUrl } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)

  async function handleGoogle() {
    setError('')
    try {
      console.log('[Register] Starting Google auth...')
      const url = await googleLogin()
      console.log('[Register] Opening WebView with URL')
      setGoogleUrl(url)
    } catch (err: any) {
      console.log('[Register] Google auth error:', err.message)
      setError(err.message || 'Erreur Google')
    }
  }

  async function handleGoogleSuccess(callbackUrl: string) {
    try {
      await handleGoogleCallbackUrl(callbackUrl)
      console.log('[Register] Google auth successful, redirecting...')
      setGoogleUrl(null)
      router.replace('/')
    } catch (err: any) {
      console.log('[Register] Callback failed:', err.message)
      setGoogleUrl(null)
      setError(err.message || 'Erreur Google')
    }
  }

  function handleGoogleError(msg: string) {
    console.log('[Register] Google error:', msg)
    setGoogleUrl(null)
    setError(msg)
  }

  async function handleRegister() {
    if (!name || !email || !password || !passwordConfirmation) { setError('Veuillez remplir tous les champs'); return }
    if (password !== passwordConfirmation) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true); setError('')
    try {
      await register(name, email, password, passwordConfirmation)
      router.replace('/')
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Créez votre compte Invoiça</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} placeholder="Nom" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmer le mot de passe" placeholderTextColor={COLORS.textMuted} value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer un compte</Text>}
        </TouchableOpacity>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
          <Image source={require('../../assets/images/google-logo.png')} style={styles.googleLogo} />
          <Text style={styles.googleButtonText}>   S'inscrire avec Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>Déjà un compte ? Connectez-vous</Text>
        </TouchableOpacity>
      </ScrollView>
      <GoogleAuthBrowser
        url={googleUrl || ''}
        visible={!!googleUrl}
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        onClose={() => setGoogleUrl(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl },
  backBtn: { marginBottom: SPACING.lg },
  backText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.lg },
  error: { color: COLORS.danger, textAlign: 'center', marginBottom: SPACING.md, fontSize: 13 },
  input: {
    backgroundColor: COLORS.background, padding: 14, borderRadius: RADIUS.md,
    fontSize: 15, marginBottom: 12, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 4 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },
  googleButton: { flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 4, backgroundColor: COLORS.white },
  googleButtonText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  googleLogo: { width: 20, height: 20, resizeMode: 'contain' },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: SPACING.lg, fontSize: 14, fontWeight: '500' },
})
