import { useState, useRef } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StepIndicator from '@/components/ui/StepIndicator'
import { OutlineButton, PrimaryButton } from '@/components/ui/Buttons'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

interface LineItem {
  id: string
  designation: string
  quantity: string
  unitPrice: string
}

export default function NewDocumentLignes() {
  const params = useLocalSearchParams<any>()
  const [items, setItems] = useState<LineItem[]>(() => {
    if (params.items) {
      try { return JSON.parse(params.items as string) } catch {}
    }
    return []
  })
  const inputRefs = useRef<Map<string, TextInput>>(new Map())

  function updateItem(id: string, field: keyof LineItem, value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function addItem() {
    const newId = Date.now().toString()
    setItems(prev => [...prev, { id: newId, designation: '', quantity: '1', unitPrice: '0' }])
    setTimeout(() => inputRefs.current.get(newId)?.focus(), 100)
  }

  const sousTotal = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0) * (parseInt(item.unitPrice) || 0), 0)

  function handleNext() {
    const itemsJson = JSON.stringify(items)
    router.push({ pathname: '/documents/new-frais', params: { ...params, items: itemsJson, sousTotal: sousTotal.toString() } })
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScreenHeader title={params.type === 'invoice' ? 'Nouvelle facture' : 'Nouveau devis'} showBack variant="white" />
      <StepIndicator currentStep={2} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg }} keyboardShouldPersistTaps="handled">
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Désignation</Text>
          <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>Qté</Text>
          <Text style={[styles.th, { flex: 0.7, textAlign: 'right' }]}>P.U</Text>
          <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>Montant</Text>
          <View style={{ width: 24 }} />
        </View>
        {items.length === 0 && (
          <Text style={styles.emptyHint}>Ajoutez au moins un article</Text>
        )}
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <TextInput ref={r => { if (r) inputRefs.current.set(item.id, r) }} style={[styles.cell, { flex: 2 }]} value={item.designation} onChangeText={v => updateItem(item.id, 'designation', v)} placeholder="Article" placeholderTextColor={COLORS.textMuted} />
            <TextInput style={[styles.cell, { flex: 0.7, textAlign: 'center' }]} value={item.quantity} onChangeText={v => updateItem(item.id, 'quantity', v)} keyboardType="numeric" onFocus={() => { if (item.quantity === '1') updateItem(item.id, 'quantity', '') }} />
            <TextInput style={[styles.cell, { flex: 0.7, textAlign: 'right' }]} value={item.unitPrice} onChangeText={v => updateItem(item.id, 'unitPrice', v)} keyboardType="numeric" onFocus={() => { if (item.unitPrice === '0') updateItem(item.id, 'unitPrice', '') }} />
            <Text style={[styles.cellText, { flex: 0.8, textAlign: 'right' }]}>{(parseInt(item.quantity) * parseInt(item.unitPrice)).toLocaleString('fr-FR')}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+ Ajouter un article</Text>
        </TouchableOpacity>
        <View style={styles.sousTotalRow}>
          <Text style={styles.sousTotalLabel}>Sous-total</Text>
          <Text style={styles.sousTotalValue}>{sousTotal.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View style={styles.footerBtns}>
          <View style={{ flex: 1 }}><OutlineButton label="Précédent" onPress={() => router.back()} /></View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}><PrimaryButton label="Suivant" onPress={handleNext} /></View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 8 },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  emptyHint: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, paddingVertical: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  cell: { fontSize: 13, color: COLORS.textPrimary, paddingVertical: 4, paddingHorizontal: 4 },
  cellText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500', paddingVertical: 4 },
  deleteBtn: { width: 24, alignItems: 'center' },
  deleteBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  addBtn: { backgroundColor: COLORS.primaryLighter, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center', marginVertical: 12 },
  addBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  sousTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 16 },
  sousTotalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  sousTotalValue: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  footerBtns: { flexDirection: 'row', marginTop: SPACING.md },
})
