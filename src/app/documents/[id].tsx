import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, StatusBar, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getDocument, deleteDocument, sendDocumentEmail } from '@/lib/document'
import type { Document } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { PrimaryButton, OutlineButton } from '@/components/ui/Buttons'

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const d = await getDocument(Number(id))
        setDoc(d)
      } catch { Alert.alert('Erreur', 'Document introuvable'); router.back() }
      finally { setLoading(false) }
    })()
  }, [id])

  async function handleDelete() {
    Alert.alert('Confirmer', 'Supprimer ce document ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await deleteDocument(Number(id)); router.back() }
        catch { Alert.alert('Erreur', 'Impossible de supprimer') }
      }},
    ])
  }

  async function handleSendEmail() {
    const email = doc?.client?.email
    if (!email) { Alert.alert('Erreur', 'Ce client n\'a pas d\'email renseigné'); return }
    try {
      await sendDocumentEmail(Number(id), email)
      Alert.alert('Succès', `PDF envoyé à ${email}`)
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || "Impossible d'envoyer l'email")
    }
  }

  if (loading || !doc) {
    return <View style={styles.centered}><Text>Chargement...</Text></View>
  }

  const typeLabel = doc.type === 'quote' ? 'Devis' : 'Facture'

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
          {doc.items?.map((item, i) => (
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
              <Text style={styles.totalValue}>{parseFloat(doc.subtotal).toLocaleString('fr-FR')} F CFA</Text>
            </View>
            {parseFloat(doc.labor_cost) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Main d'œuvre</Text>
                <Text style={styles.totalValue}>{parseFloat(doc.labor_cost).toLocaleString('fr-FR')} F CFA</Text>
              </View>
            )}
            {parseFloat(doc.transport_cost) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Transport</Text>
                <Text style={styles.totalValue}>{parseFloat(doc.transport_cost).toLocaleString('fr-FR')} F CFA</Text>
              </View>
            )}
            {parseFloat(doc.other_cost) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Autres frais</Text>
                <Text style={styles.totalValue}>{parseFloat(doc.other_cost).toLocaleString('fr-FR')} F CFA</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total général</Text>
              <Text style={styles.grandTotalValue}>{parseFloat(doc.total).toLocaleString('fr-FR')} F CFA</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Envoyer par email" icon="mail-outline" onPress={handleSendEmail} />
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  deleteBtn: { borderWidth: 1, borderColor: COLORS.danger, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  deleteBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },
})
