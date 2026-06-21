import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { getCompany } from '@/lib/company'
import type { Company } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormFieldCard from '@/components/ui/FormFieldCard'
import { PrimaryButton } from '@/components/ui/Buttons'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)

  useEffect(() => {
    getCompany().then(setCompany).catch(() => {})
  }, [])

  async function handleLogout() {
    await logout()
    router.replace('/welcome')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Profil entreprise" variant="white" titleAlign="left" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        <View style={styles.logoPlaceholder}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.logoImg} />
          <TouchableOpacity style={styles.cameraBtn}>
            <Ionicons name="camera" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <FormFieldCard label="Nom" value={company?.name || user?.name || ''} />
        <FormFieldCard label="Adresse" value={company?.address || ''} />
        <FormFieldCard label="Téléphone" value={company?.phone || ''} />
        <FormFieldCard label="Email" value={company?.email || user?.email || ''} />
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/company/edit')}>
          <Text style={styles.editBtnText}>Modifier</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Signature & Tampon</Text>
        <View style={styles.signatureRow}>
          <TouchableOpacity style={styles.signatureCard}>
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
            <Text style={styles.signatureText}>Signature</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signatureCard}>
            <View style={styles.stampCircle}>
              <Text style={styles.stampText}>T</Text>
            </View>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} style={styles.stampIcon} />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <PrimaryButton label="Se déconnecter" onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },
  logoPlaceholder: { alignItems: 'center', marginBottom: 16, position: 'relative' },
  logoImg: { width: 100, height: 100, resizeMode: 'contain' },
  cameraBtn: { position: 'absolute', bottom: 0, right: '50%', marginRight: -50, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  editBtn: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  editBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  signatureRow: { flexDirection: 'row', gap: 12 },
  signatureCard: { flex: 1, height: 80, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  signatureText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  stampCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  stampText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  stampIcon: { position: 'absolute', bottom: 4, right: 4 },
})
