import { useState, useRef } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StepIndicator from '@/components/ui/StepIndicator'
import { OutlineButton, PrimaryButton } from '@/components/ui/Buttons'
import { createDocument, updateDocument } from '@/lib/document'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import AppModal from '@/components/ui/AppModal'

interface FeeItem {
  id: string
  label: string
  amount: string
}

export default function NewDocumentFrais() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<any>()
  const [fees, setFees] = useState<FeeItem[]>(() => {
    if (params.fees) {
      try { return JSON.parse(params.fees as string) } catch {}
    }
    return [{ id: '1', label: "Main d'œuvre", amount: '0' }]
  })
  const feeRefs = useRef<Map<string, TextInput>>(new Map())
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<{ visible: boolean; type: 'success'|'error'; title: string; message: string; buttons?: { text: string; onPress?: () => void; primary?: boolean }[] }>({ visible: false, type: 'success', title: '', message: '' })

  function updateFee(id: string, field: keyof FeeItem, value: string) {
    setFees(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  function removeFee(id: string) {
    setFees(prev => prev.filter(f => f.id !== id))
  }

  function addFee() {
    const newId = Date.now().toString()
    setFees(prev => [...prev, { id: newId, label: '', amount: '0' }])
    setTimeout(() => feeRefs.current.get(newId)?.focus(), 100)
  }

  const sousTotal = parseInt(params.sousTotal || '0')
  const totalFrais = fees.reduce((sum, fee) => sum + (parseInt(fee.amount) || 0), 0)
  const totalGeneral = sousTotal + totalFrais

  const isEdit = !!params.editId

  async function handleCreate() {
    setSaving(true)
    try {
      const feeAmounts = fees.map(f => parseInt(f.amount) || 0)
      const payload: any = {
        client_id: parseInt(params.clientId),
        type: params.type || 'quote',
        project_name: params.projectName || '',
        issue_date: params.issueDate || new Date().toISOString().split('T')[0],
        valid_until: params.validUntil || null,
        notes: params.notes || null,
        subtotal: sousTotal,
        labor_cost: feeAmounts[0] || 0,
        transport_cost: feeAmounts[1] || 0,
        other_cost: feeAmounts.slice(2).reduce((s, v) => s + v, 0),
        total: totalGeneral,
      }

      const { default: api } = await import('@/lib/api')
      const items = params.items ? JSON.parse(params.items as string) : []

      async function saveFees(docId: number) {
        for (const fee of fees) {
          if (parseInt(fee.amount) > 0) {
            await api.post(`/documents/${docId}/items`, {
              designation: `FEE:${fee.label}`,
              quantity: 1,
              unit_price: parseFloat(fee.amount) || 0,
            })
          }
        }
      }

      if (isEdit) {
        await updateDocument(parseInt(params.editId), payload)
        const existing = await api.get(`/documents/${params.editId}`)
        const existingItems = existing.data.items || []
        for (const oldItem of existingItems) {
          try { await api.delete(`/documents/${params.editId}/items/${oldItem.id}`) } catch {}
        }
        for (const item of items) {
          await api.post(`/documents/${params.editId}/items`, {
            designation: item.designation || 'Article',
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unitPrice) || 0,
          })
        }
        await saveFees(parseInt(params.editId))
        setModal({
          visible: true, type: 'success', title: 'Succès', message: 'Document modifié avec succès',
          buttons: [
            { text: 'Voir le document', primary: true, onPress: () => router.replace(`/documents/${params.editId}`) },
            { text: 'Retour au tableau de bord', onPress: () => router.replace('/(tabs)') },
          ],
        })
      } else {
        const doc = await createDocument(payload)
        if (items.length > 0) {
          for (const item of items) {
            await api.post(`/documents/${doc.id}/items`, {
              designation: item.designation || 'Article',
              quantity: parseFloat(item.quantity) || 1,
              unit_price: parseFloat(item.unitPrice) || 0,
            })
          }
        }
        await saveFees(doc.id)
        setModal({
          visible: true, type: 'success', title: 'Succès', message: 'Document créé avec succès',
          buttons: [
            { text: 'Voir le document', primary: true, onPress: () => router.replace(`/documents/${doc.id}`) },
            { text: 'Retour au tableau de bord', onPress: () => router.replace('/(tabs)') },
          ],
        })
      }
    } catch (err: any) {
      setModal({ visible: true, type: 'error', title: 'Erreur', message: err.response?.data?.message || 'Impossible de créer le document' })
    } finally { setSaving(false) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScreenHeader title={isEdit ? 'Modifier le document' : params.type === 'invoice' ? 'Nouvelle facture' : 'Nouveau devis'} showBack variant="white" />
      <StepIndicator currentStep={3} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.5 }]}>Frais</Text>
          <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>Montant</Text>
          <View style={{ width: 24 }} />
        </View>
        {fees.length === 0 && (
          <Text style={styles.emptyHint}>Ajoutez au moins un frais</Text>
        )}
        {fees.map(fee => (
          <View key={fee.id} style={styles.feeRow}>
            <TextInput ref={r => { if (r) feeRefs.current.set(fee.id, r) }} style={[styles.cell, { flex: 1.5 }]} value={fee.label} onChangeText={v => updateFee(fee.id, 'label', v)} placeholder="Libellé" placeholderTextColor={COLORS.textMuted} />
            <TextInput style={[styles.cell, { flex: 0.8, textAlign: 'right' }]} value={fee.amount} onChangeText={v => updateFee(fee.id, 'amount', v)} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} onFocus={() => { if (fee.amount === '0') updateFee(fee.id, 'amount', '') }} />
            <TouchableOpacity onPress={() => removeFee(fee.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addFee}>
          <Text style={styles.addBtnText}>+ Ajouter un frais</Text>
        </TouchableOpacity>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{sousTotal.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total frais</Text>
            <Text style={styles.summaryValue}>{totalFrais.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total général</Text>
            <Text style={styles.totalValue}>{totalGeneral.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>
        <View style={styles.footerBtns}>
          <View style={{ flex: 1 }}><OutlineButton label="Précédent" onPress={() => router.back()} /></View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le document'}
              onPress={handleCreate}
              disabled={saving}
            />
          </View>
        </View>
      </ScrollView>
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 8 },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  emptyHint: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, paddingVertical: 20 },
  feeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  cell: { fontSize: 13, color: COLORS.textPrimary, paddingVertical: 4, paddingHorizontal: 4 },
  deleteBtn: { width: 24, alignItems: 'center' },
  deleteBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  addBtn: { backgroundColor: COLORS.primaryLighter, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center', marginVertical: 12 },
  addBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  summaryCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14, marginTop: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  totalRow: { backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, padding: 10, marginTop: 6 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  totalValue: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  footerBtns: { flexDirection: 'row', marginTop: SPACING.md },
})
