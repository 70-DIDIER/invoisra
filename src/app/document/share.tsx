import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { OutlineButton } from '@/components/ui/Buttons'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

const SHARE_OPTIONS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: COLORS.whatsapp },
  { key: 'telegram', label: 'Telegram', icon: 'send', color: COLORS.telegram },
  { key: 'email', label: 'Email', icon: 'mail-outline', color: COLORS.email },
  { key: 'print', label: 'Imprimer', icon: 'print-outline', color: COLORS.textSecondary },
  { key: 'save', label: "Enregistrer sur l'appareil", icon: 'download-outline', color: COLORS.textSecondary },
]

export default function ShareScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScreenHeader title="Partager le document" showBack variant="green" />
      <View style={styles.body}>
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
            <TouchableOpacity key={opt.key} style={styles.optionRow}>
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '20' }]}>
                <Ionicons name={opt.icon as any} size={20} color={opt.color} />
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
        <OutlineButton label="Annuler" onPress={() => router.back()} style={{ marginTop: SPACING.lg }} />
      </View>
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
