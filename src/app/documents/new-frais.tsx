import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StepIndicator from '@/components/ui/StepIndicator'
import { OutlineButton, PrimaryButton } from '@/components/ui/Buttons'
import { createDocument } from '@/lib/document'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function NewDocumentFrais() {
  const params = useLocalSearchParams<any>()
  const [laborCost, setLaborCost] = useState('25000')
  const [transportCost, setTransportCost] = useState('5000')
  const [otherCost, setOtherCost] = useState('3000')
  const [saving, setSaving] = useState(false)

  const sousTotal = parseInt(params.sousTotal || '0')
  const totalFrais = (parseInt(laborCost) || 0) + (parseInt(transportCost) || 0) + (parseInt(otherCost) || 0)
  const totalGeneral = sousTotal + totalFrais

  async function handleCreate() {
    setSaving(true)
    try {
      const payload: any = {
        client_id: parseInt(params.clientId),
        type: params.type || 'quote',
        project_name: params.projectName || '',
        issue_date: params.issueDate || new Date().toISOString().split('T')[0],
        valid_until: params.validUntil || null,
        notes: params.notes || null,
        subtotal: sousTotal,
        labor_cost: parseInt(laborCost) || 0,
        transport_cost: parseInt(transportCost) || 0,
        other_cost: parseInt(otherCost) || 0,
        total: totalGeneral,
      }
      const doc = await createDocument(payload)
      const docId = doc.id

      const items = params.items ? JSON.parse(params.items as string) : []
      if (items.length > 0) {
        const { default: api } = await import('@/lib/api')
        for (const item of items) {
          await api.post(`/documents/${docId}/items`, {
            designation: item.designation || 'Article',
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unitPrice) || 0,
          })
        }
      }
      Alert.alert('Succès', 'Document créé avec succès', [
        { text: 'Voir le document', onPress: () => router.replace(`/documents/${docId}`) },
        { text: 'Retour au tableau de bord', onPress: () => router.replace('/(tabs)') },
      ])
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || "Impossible de créer le document")
    } finally { setSaving(false) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScreenHeader title={params.type === 'invoice' ? 'Nouvelle facture' : 'Nouveau devis'} showBack variant="white" />
      <StepIndicator currentStep={3} />
      <ScrollView contentContainerStyle={{ padding: SPACING.lg }} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Frais supplémentaires</Text>
        <FeeRow label="Main d'œuvre" value={laborCost} onChange={setLaborCost} />
        <FeeRow label="Transport" value={transportCost} onChange={setTransportCost} />
        <FeeRow label="Autres frais" value={otherCost} onChange={setOtherCost} />
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{sousTotal.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total frais</Text>
            <Text style={styles.summaryValue}>{totalFrais.toLocaleString('fr-FR')} F CFA</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total général</Text>
            <Text style={styles.totalValue}>{totalGeneral.toLocaleString('fr-FR')} F CFA</Text>
          </View>
        </View>
        <View style={styles.footerBtns}>
          <View style={{ flex: 1 }}><OutlineButton label="Précédent" onPress={() => router.back()} /></View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={saving ? 'Création...' : 'Créer le document'}
              onPress={handleCreate}
              disabled={saving}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function FeeRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeLabel}>{label}</Text>
      <TextInput style={styles.feeInput} value={value} onChangeText={onChange} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
    </View>
  )
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  feeLabel: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  feeInput: { fontSize: 14, color: COLORS.textPrimary, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: COLORS.background, borderRadius: RADIUS.sm, textAlign: 'right', minWidth: 100 },
  summaryCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14, marginTop: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  totalRow: { backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, padding: 10, marginTop: 6 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  totalValue: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  footerBtns: { flexDirection: 'row', marginTop: SPACING.md },
})
