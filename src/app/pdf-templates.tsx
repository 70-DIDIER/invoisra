import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { PrimaryButton } from '@/components/ui/Buttons'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

const TEMPLATES = [
  { id: '1', name: 'Modèle 1', style: 'Classique', color: COLORS.primary },
  { id: '2', name: 'Modèle 2', style: 'Moderne', color: '#2C3E50' },
  { id: '3', name: 'Modèle 3', style: 'BTP', color: '#C0392B' },
  { id: '4', name: 'Modèle 4', style: 'Artisan', color: '#8D6E63' },
  { id: '5', name: 'Modèle 5', style: 'Minimaliste', color: COLORS.textMuted },
]

export default function PdfTemplatesScreen() {
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState('1')

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <ScreenHeader title="Modèles de PDF" showBack variant="green" />
      <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + SPACING.lg }]} nestedScrollEnabled>
        <Text style={styles.info}>Choisissez un modèle pour vos documents PDF</Text>
        {TEMPLATES.map(t => (
          <TouchableOpacity key={t.id} style={styles.templateCard} onPress={() => setSelected(t.id)}>
            <View style={[styles.thumbnail, { borderTopColor: t.color }]}>
              <View style={[styles.thumbBar, { backgroundColor: t.color }]} />
              <View style={styles.thumbLine} />
              <View style={[styles.thumbLine, { width: '60%' }]} />
              <View style={[styles.thumbLine, { width: '80%' }]} />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{t.name}</Text>
              <Text style={styles.templateStyle}>{t.style}</Text>
            </View>
            {selected === t.id && (
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ marginTop: SPACING.lg }}>
          <PrimaryButton label="Appliquer ce modèle" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, marginTop: -16 },
  bodyContent: { padding: SPACING.lg, paddingBottom: SPACING.lg },
  info: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, textAlign: 'center' },
  templateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  thumbnail: { width: 70, height: 80, borderRadius: RADIUS.sm, borderWidth: 1, borderTopWidth: 8, borderColor: COLORS.border, overflow: 'hidden', padding: 6, justifyContent: 'center' },
  thumbBar: { height: 6, borderRadius: 2, marginBottom: 6 },
  thumbLine: { height: 4, borderRadius: 2, backgroundColor: COLORS.divider, marginBottom: 4 },
  templateInfo: { flex: 1, marginLeft: 12 },
  templateName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  templateStyle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
})
