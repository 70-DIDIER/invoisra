import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getDocument } from '@/lib/document'
import type { Document } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { PrimaryButton, OutlineButton } from '@/components/ui/Buttons'
import AppModal from '@/components/ui/AppModal'

interface FeeItem {
  id: string
  label: string
  amount: string
}

function parseFeesFromNotes(notes: string | null): FeeItem[] {
  if (!notes) return []
  const match = notes.match(/___FEES___(\[.*?\])/s)
  if (match) {
    try { return JSON.parse(match[1]) } catch { return [] }
  }
  return []
}

function cleanNotes(notes: string | null): string {
  if (!notes) return ''
  const idx = notes.indexOf('___FEES___')
  return idx >= 0 ? notes.substring(0, idx).trim() : notes.trim()
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ visible: false, title: '', message: '' })

  useEffect(() => {
    (async () => {
      try {
        const d = await getDocument(Number(id))
        setDoc(d)
      } catch { setModal({ visible: true, title: 'Erreur', message: 'Document introuvable' }) }
      finally { setLoading(false) }
    })()
  }, [id])

  if (loading || !doc) {
    return <View style={styles.centered}><Text>Chargement...</Text></View>
  }

  const typeLabel = doc.type === 'quote' ? 'Devis' : 'Facture'
  const feeItems = doc.items?.filter(i => i.designation.startsWith('FEE:')) || []
  const articleItems = doc.items?.filter(i => !i.designation.startsWith('FEE:')) || []
  const feesFromItems = feeItems.map(i => ({ id: i.id.toString(), label: i.designation.replace('FEE:', ''), amount: i.unit_price }))
  const fees = feesFromItems.length > 0 ? feesFromItems : parseFeesFromNotes(doc.notes)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScreenHeader title="Aperçu du document" showBack variant="green" />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.pdfCard}>
          <Text style={styles.docTypeTitle}>{typeLabel}</Text>
          <Text style={styles.docNumber}>N° {doc.number}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>{new Date(doc.issue_date).toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valable jusqu'au :</Text>
            <Text style={styles.infoValue}>{doc.valid_until ? new Date(doc.valid_until).toLocaleDateString('fr-FR') : '-'}</Text>
          </View>
          <View style={styles.clientBox}>
            <Text style={styles.clientName}>{doc.client?.name}</Text>
            {doc.client?.email && <Text style={styles.clientInfo}>{doc.client.email}</Text>}
            {doc.client?.phone && <Text style={styles.clientInfo}>{doc.client.phone}</Text>}
          </View>
          {doc.project_name ? <Text style={styles.projectName}>Projet : {doc.project_name}</Text> : null}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 2 }]}>Désignation</Text>
            <Text style={[styles.th, { flex: 0.5, textAlign: 'center' }]}>Qté</Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>Montant</Text>
          </View>
          {articleItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 2 }]}>{item.designation}</Text>
              <Text style={[styles.td, { flex: 0.5, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.td, { flex: 0.8, textAlign: 'right', fontWeight: '600' }]}>
                {parseFloat(item.total_price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{parseFloat(doc.subtotal).toLocaleString('fr-FR')} FCFA</Text>
            </View>
            {fees.length > 0 ? fees.map((fee, i) => (
              <View key={i} style={styles.totalRow}>
                <Text style={styles.totalLabel}>{fee.label}</Text>
                <Text style={styles.totalValue}>{parseInt(fee.amount).toLocaleString('fr-FR')} FCFA</Text>
              </View>
            )            ) : (
              <View>
                {parseFloat(doc.labor_cost) > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Main d'œuvre</Text>
                    <Text style={styles.totalValue}>{parseFloat(doc.labor_cost).toLocaleString('fr-FR')} FCFA</Text>
                  </View>
                )}
                {parseFloat(doc.transport_cost) > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Transport</Text>
                    <Text style={styles.totalValue}>{parseFloat(doc.transport_cost).toLocaleString('fr-FR')} FCFA</Text>
                  </View>
                )}
                {parseFloat(doc.other_cost) > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Autres frais</Text>
                    <Text style={styles.totalValue}>{parseFloat(doc.other_cost).toLocaleString('fr-FR')} FCFA</Text>
                  </View>
                )}
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total général</Text>
              <Text style={styles.grandTotalValue}>{parseFloat(doc.total).toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Partager / Télécharger PDF" icon="share-outline" onPress={() => router.push({ pathname: '/document/share', params: { id, clientEmail: doc.client?.email } })} />
          <TouchableOpacity style={styles.editBtn} onPress={() => {
            const feeItemData = doc.items?.filter(i => i.designation.startsWith('FEE:')) || []
            const articleData = doc.items?.filter(i => !i.designation.startsWith('FEE:')) || []
            const itemsJson = JSON.stringify(articleData.map(i => ({
              id: i.id.toString(), designation: i.designation,
              quantity: i.quantity, unitPrice: i.unit_price,
            })))
            const feesFromItems = feeItemData.map(i => ({
              id: i.id.toString(), label: i.designation.replace('FEE:', ''),
              amount: i.unit_price,
            }))
            const feesFromNotes = parseFeesFromNotes(doc.notes)
            const feesJson = JSON.stringify(feesFromItems.length > 0 ? feesFromItems : feesFromNotes.length > 0 ? feesFromNotes : [
              ...(parseFloat(doc.labor_cost) > 0 ? [{ id: '1', label: "Main d'œuvre", amount: doc.labor_cost }] : []),
              ...(parseFloat(doc.transport_cost) > 0 ? [{ id: '2', label: 'Transport', amount: doc.transport_cost }] : []),
              ...(parseFloat(doc.other_cost) > 0 ? [{ id: '3', label: 'Autres frais', amount: doc.other_cost }] : []),
            ])
            router.push({
              pathname: '/documents/new',
              params: {
                editId: doc.id,
                type: doc.type,
                issueDate: (doc.issue_date || '').split('T')[0],
                clientId: doc.client_id,
                clientName: doc.client?.name,
                projectName: doc.project_name || '',
                validUntil: (doc.valid_until || '').split('T')[0],
                notes: cleanNotes(doc.notes),
                items: itemsJson,
                sousTotal: doc.subtotal,
                fees: feesJson,
              },
            })
          }}>
            <Text style={styles.editBtnText}>Éditer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AppModal
        visible={modal.visible}
        type="error"
        title={modal.title}
        message={modal.message}
        buttons={[{ text: 'OK', primary: true, onPress: () => router.back() }]}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, marginTop: -16 },
  bodyContent: { padding: SPACING.lg },
  pdfCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  docTypeTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  docNumber: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary },
  infoValue: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  clientBox: { backgroundColor: COLORS.background, borderRadius: RADIUS.sm, padding: 10, marginVertical: 10 },
  clientName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  clientInfo: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 8, borderTopLeftRadius: RADIUS.sm, borderTopRightRadius: RADIUS.sm },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  td: { fontSize: 12, color: COLORS.textPrimary },
  projectName: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 8 },
  totalSection: { marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary },
  totalValue: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  grandTotal: { backgroundColor: COLORS.primaryLighter, borderRadius: RADIUS.sm, padding: 10, marginTop: 4 },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  grandTotalValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  actions: { marginTop: SPACING.lg, gap: 12 },
  editBtn: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  editBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
})
