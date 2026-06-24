import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '@/hooks/useAuth'
import { getCompany, uploadCompanyFile, deleteCompanyFile } from '@/lib/company'
import type { Company } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormFieldCard from '@/components/ui/FormFieldCard'
import { PrimaryButton } from '@/components/ui/Buttons'

type UploadType = 'logo' | 'signature' | 'stamp'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [uploading, setUploading] = useState<UploadType | null>(null)

  useFocusEffect(useCallback(() => {
    getCompany().then(setCompany).catch(() => {})
  }, []))

  async function handleLogout() {
    await logout()
    router.replace('/welcome')
  }

  async function pickAndUpload(type: UploadType) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire pour uploader une image.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [4, 2],
      quality: 0.8,
    })

    if (result.canceled) return

    const uri = result.assets[0].uri
    setUploading(type)
    try {
      const url = await uploadCompanyFile(uri, type)
      setCompany(prev => prev ? { ...prev, [type]: url } : prev)
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'uploader l\'image')
    } finally {
      setUploading(null)
    }
  }

  async function handleDelete(type: UploadType) {
    Alert.alert(
      'Supprimer',
      `Supprimer ${type === 'logo' ? 'le logo' : type === 'signature' ? 'la signature' : 'le tampon'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            setUploading(type)
            try {
              await deleteCompanyFile(type)
              setCompany(prev => prev ? { ...prev, [type]: null } : prev)
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le fichier')
            } finally {
              setUploading(null)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safe}>
      <ScreenHeader title="Profil entreprise" variant="white" titleAlign="left" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} nestedScrollEnabled>

        <Text style={styles.sectionTitle}>Informations générales</Text>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <TouchableOpacity style={styles.logoWrapper} onPress={() => pickAndUpload('logo')} disabled={!!uploading}>
            {uploading === 'logo' ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : company?.logo ? (
              <Image source={{ uri: company.logo }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.logoHint}>Logo entreprise</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          {company?.logo && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete('logo')} disabled={!!uploading}>
              <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
              <Text style={styles.deleteBtnText}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>

        <FormFieldCard label="Nom" value={company?.name || user?.name || ''} />
        <FormFieldCard label="Adresse" value={company?.address || ''} />
        <FormFieldCard label="Téléphone" value={company?.phone || ''} />
        <FormFieldCard label="Email" value={company?.email || user?.email || ''} />
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/company/edit')}>
          <Text style={styles.editBtnText}>Modifier les informations</Text>
        </TouchableOpacity>

        {/* Signature & Tampon */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Signature & Tampon</Text>
        <View style={styles.signatureRow}>
          <UploadCard
            label="Signature"
            imageUri={company?.signature}
            uploading={uploading === 'signature'}
            onPress={() => pickAndUpload('signature')}
            onDelete={() => handleDelete('signature')}
            disabled={!!uploading}
          />
          <UploadCard
            label="Tampon"
            imageUri={company?.stamp}
            uploading={uploading === 'stamp'}
            onPress={() => pickAndUpload('stamp')}
            onDelete={() => handleDelete('stamp')}
            disabled={!!uploading}
          />
        </View>

        <View style={{ marginTop: SPACING.lg }}>
          <PrimaryButton label="Se déconnecter" onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

function UploadCard({ label, imageUri, uploading, onPress, onDelete, disabled }: {
  label: string
  imageUri?: string | null
  uploading: boolean
  onPress: () => void
  onDelete: () => void
  disabled: boolean
}) {
  return (
    <View style={styles.uploadCardContainer}>
      <TouchableOpacity style={styles.uploadCard} onPress={onPress} disabled={disabled}>
        {uploading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.uploadCardImg} resizeMode="contain" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={styles.uploadCardHint}>{label}</Text>
          </>
        )}
        <View style={styles.uploadCardBadge}>
          <Ionicons name="camera" size={12} color={COLORS.white} />
        </View>
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} disabled={disabled}>
          <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
          <Text style={styles.deleteBtnText}>Supprimer</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },

  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logoWrapper: { position: 'relative', width: 110, height: 110, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'visible', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  logoImg: { width: 110, height: 110, borderRadius: RADIUS.lg, resizeMode: 'contain' },
  logoPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  logoHint: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  cameraBtn: { position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },

  editBtn: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center', marginBottom: 12, marginTop: 4 },
  editBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  signatureRow: { flexDirection: 'row', gap: 12 },
  uploadCardContainer: { flex: 1, alignItems: 'center' },
  uploadCard: { width: '100%', height: 90, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, position: 'relative', overflow: 'visible' },
  uploadCardImg: { width: '100%', height: '100%', borderRadius: RADIUS.md },
  uploadCardHint: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  uploadCardBadge: { position: 'absolute', bottom: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  deleteBtnText: { fontSize: 12, color: COLORS.danger, fontWeight: '500' },
})
