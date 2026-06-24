import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Invoiça</Text>
        <Text style={styles.subtitle}>Vos devis et factures{'\n'}en quelques clics.</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.registerButton} onPress={() => router.push('/register')}>
          <Text style={styles.registerText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  title: { fontSize: 42, fontWeight: '800', color: COLORS.white, marginBottom: 12 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 22, marginBottom: 48 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 16 },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  loginButton: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  loginText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  registerButton: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center' },
  registerText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
})
