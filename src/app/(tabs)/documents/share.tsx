import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import { sharePdf, shareViaWhatsApp, shareViaTelegram, shareViaEmail } from '@/lib/pdf'
import { sendDocumentEmail } from '@/lib/document'
import { useState } from 'react'
import AppModal from '@/components/ui/AppModal'

export default function ShareScreen() {
  const { id, clientEmail } = useLocalSearchParams<{ id?: string; clientEmail?: string }>()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState<string | null>(null)
  const [modal, setModal] = useState({ visible: false, type: 'success' as 'success' | 'error', title: '', message: '' })

  async function handleShare(key: string) {
    if (!id) return
    setLoading(key)
    try {
      switch (key) {
        case 'whatsapp': await shareViaWhatsApp(parseInt(id)); break
        case 'telegram': await shareViaTelegram(parseInt(id)); break
        case 'email':
          if (clientEmail) {
            await sendDocumentEmail(parseInt(id), clientEmail)
            setModal({ visible: true, type: 'success', title: 'Succès', message: 'Email envoyé avec le PDF' })
          } else {
            await shareViaEmail(parseInt(id))
          }
          break
        case 'print':
        case 'save':
          await sharePdf(parseInt(id))
          break
      }
    } catch (err: any) {
      setModal({ visible: true, type: 'error', title: 'Erreur', message: err.message || 'Action indisponible' })
    } finally { setLoading(null) }
  }

  const SHARE_OPTIONS = [
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: COLORS.whatsapp },
    { key: 'telegram', label: 'Telegram', icon: 'send', color: COLORS.telegram },
    { key: 'email', label: 'Email', icon: 'mail-outline', color: COLORS.email },
    { key: 'print', label: 'Imprimer', icon: 'print-outline', color: COLORS.textSecondary },
    { key: 'save', label: "Enregistrer sur l'appareil", icon: 'download-outline', color: COLORS.textSecondary },
  ]

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <ScreenHeader title="Partager le document" showBack variant="green" />
      <View style={[styles.body, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <View style={styles.docIconWrap}>
          <View style={styles.docIcon}>
            <View style={styles.docFold} />
            <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.checkOverlay}>
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
          </View>
        </View>
        <Text style={styles.readyTitle}>Votre PDF est prêt !</Text>
        <Text style={styles.readySub}>Que voulez-vous faire ?</Text>
        <View style={styles.optionsList}>
          {SHARE_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} style={styles.optionRow} onPress={() => handleShare(opt.key)} disabled={loading === opt.key}>
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '20' }]}>
                {loading === opt.key
                  ? <ActivityIndicator size="small" color={opt.color} />
                  : <Ionicons name={opt.icon as any} size={20} color={opt.color} />}
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, marginTop: -16, padding: SPACING.lg, alignItems: 'center' },
  docIconWrap: { position: 'relative', marginTop: SPACING.lg, marginBottom: SPACING.md },
  docIcon: { width: 80, height: 90, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  docFold: { position: 'absolute', top: -1, right: -1, width: 0, height: 0, borderStyle: 'solid', borderRightWidth: 16, borderTopWidth: 16, borderRightColor: COLORS.primaryLighter, borderTopColor: COLORS.primaryLighter, borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  checkOverlay: { position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  readyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 8 },
  readySub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  optionsList: { alignSelf: 'stretch' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  optionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
})
