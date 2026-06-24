import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { OutlineButton, PrimaryButton } from '@/components/ui/Buttons'
import { getCompany } from '@/lib/company'
import { API_BASE_URL } from '@/lib/api'
import type { Company } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

function numberToWords(n: number): string {
  if (n === 0) return 'zéro'

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']

  function below1000(num: number): string {
    const parts: string[] = []
    const h = Math.floor(num / 100)
    const r = num % 100

    if (h === 1) parts.push('cent')
    else if (h > 1) parts.push(units[h] + ' cent')

    if (r > 0) {
      if (r < 20) parts.push(units[r])
      else {
        const d = Math.floor(r / 10)
        const u = r % 10
        if (d === 7 || d === 9) {
          parts.push(tens[d] + (u > 0 ? '-' + units[10 + u] : ''))
        } else if (u === 1 && d > 1) {
          parts.push(tens[d] + ' et un')
        } else if (u > 0) {
          parts.push(tens[d] + '-' + units[u])
        } else {
          if (d === 8) parts.push('quatre-vingts')
          else parts.push(tens[d])
        }
      }
    }

    return parts.join(' ')
  }

  function translate(num: number): string {
    if (num === 0) return ''
    const billion = Math.floor(num / 1000000000)
    const million = Math.floor((num % 1000000000) / 1000000)
    const thousand = Math.floor((num % 1000000) / 1000)
    const rest = num % 1000

    const parts: string[] = []
    if (billion > 0) parts.push(below1000(billion) + (billion > 1 ? ' milliards' : ' milliard'))
    if (million > 0) parts.push(below1000(million) + (million > 1 ? ' millions' : ' million'))
    if (thousand > 0) parts.push(below1000(thousand) + (thousand > 1 ? ' mille' : ' mille'))
    if (rest > 0) parts.push(below1000(rest))

    return parts.join(' ')
  }

  return translate(n).replace(/\s+/g, ' ').trim()
}

const SERVER_BASE = API_BASE_URL.replace('/api/v1', '')

function buildUrl(path?: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SERVER_BASE}${path}`
}

export default function PdfPreviewScreen() {
  const params = useLocalSearchParams<any>()
  const [company, setCompany] = useState<Company | null>(null)
  const items = params.items ? JSON.parse(params.items as string) : []
  const fees = params.fees ? JSON.parse(params.fees as string) : []
  const sousTotal = parseInt(params.sousTotal || '0')
  const totalFees = fees.reduce((s: number, f: any) => s + (parseInt(f.amount) || 0), 0)
  const totalGeneral = parseInt(params.totalGeneral || '0') || (sousTotal + totalFees)

  useEffect(() => {
    getCompany().then(setCompany).catch(() => {})
  }, [])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <ScreenHeader title="Aperçu du devis" showBack variant="green" rightIcon="share-outline" onRightPress={() => router.push({ pathname: '/documents/share', params })} />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} nestedScrollEnabled>
        <View style={styles.pdfCard}>
          <View style={styles.companyBlock}>
            {buildUrl(company?.logo) ? (
              <Image source={{ uri: buildUrl(company?.logo)! }} style={styles.logoImg} />
            ) : (
              <Image source={require('../../../assets/images/logo.png')} style={styles.logoImg} />
            )}
            <Text style={styles.companyName}>{company?.name || ''}</Text>
            {!!company?.address && <Text style={styles.companyInfo}>{company.address}</Text>}
            {!!company?.phone && <Text style={styles.companyInfo}>{company.phone}</Text>}
            {!!company?.email && <Text style={styles.companyInfo}>{company.email}</Text>}
          </View>
          <View style={styles.divider} />
          <Text style={styles.docTypeTitle}>DEVIS</Text>
          <Text style={styles.docNumber}>N° {params.number || 'DEV-00013'}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>{params.date || '23/05/2024'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Validité :</Text>
            <Text style={styles.infoValue}>{params.validite || '22/06/2024'}</Text>
          </View>
          <View style={styles.clientBox}>
            <Text style={styles.clientBoxTitle}>Client : {params.clientName || 'Client'}</Text>
            <Text style={styles.clientBoxSub}>Chantier : {params.chantier || '-'}</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 2 }]}>Désignation</Text>
              <Text style={[styles.th, { flex: 0.5, textAlign: 'center' }]}>Qté</Text>
              <Text style={[styles.th, { flex: 0.7, textAlign: 'right' }]}>P.U</Text>
              <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>Montant</Text>
            </View>
            {items.map((item: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2 }]}>{item.designation}</Text>
                <Text style={[styles.td, { flex: 0.5, textAlign: 'center' }]}>{item.qte}</Text>
                <Text style={[styles.td, { flex: 0.7, textAlign: 'right' }]}>{parseInt(item.pu).toLocaleString('fr-FR')}</Text>
                <Text style={[styles.td, { flex: 0.8, textAlign: 'right', fontWeight: '600' }]}>{(parseInt(item.qte) * parseInt(item.pu)).toLocaleString('fr-FR')}</Text>
              </View>
            ))}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total</Text>
                <Text style={styles.totalValue}>{sousTotal.toLocaleString('fr-FR')} FCFA</Text>
              </View>
              {fees.map((f: any, i: number) => (
                <View key={i} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{f.label}</Text>
                  <Text style={styles.totalValue}>{parseInt(f.amount).toLocaleString('fr-FR')} FCFA</Text>
                </View>
              ))}
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total général</Text>
                <Text style={styles.grandTotalValue}>{totalGeneral.toLocaleString('fr-FR')} FCFA</Text>
              </View>
              <View style={styles.totalInWordsBox}>
                <Text style={styles.totalInWordsLabel}>Arrêté à la somme de :</Text>
                <Text style={styles.totalInWords}>{numberToWords(totalGeneral).charAt(0).toUpperCase() + numberToWords(totalGeneral).slice(1)} francs CFA</Text>
              </View>
            </View>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>{company?.manager_name || company?.name || ''}</Text>
            {buildUrl(company?.signature) ? (
              <Image source={{ uri: buildUrl(company?.signature)! }} style={styles.signatureImg} resizeMode="contain" />
            ) : (
              <Text style={styles.signatureScript}>Signature</Text>
            )}
            {buildUrl(company?.stamp) ? (
              <Image source={{ uri: buildUrl(company?.stamp)! }} style={styles.stampImg} resizeMode="contain" />
            ) : (
              <View style={styles.stampPreview}>
                <Text style={styles.stampPreviewText}>T</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionBtns}>
          <View style={{ flex: 1 }}><OutlineButton label="Partager" icon="share-outline" onPress={() => router.push({ pathname: '/documents/share', params })} /></View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}><PrimaryButton label="Télécharger PDF" icon="download-outline" onPress={() => {}} /></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, marginTop: -16 },
  bodyContent: { padding: SPACING.lg },
  pdfCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  companyBlock: { alignItems: 'center', marginBottom: 12 },
  logoImg: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 6 },
  companyName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  companyInfo: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 12 },
  docTypeTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  docNumber: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary },
  infoValue: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  clientBox: { backgroundColor: COLORS.background, borderRadius: RADIUS.sm, padding: 10, marginVertical: 10 },
  clientBoxTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  clientBoxSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 8, borderTopLeftRadius: RADIUS.sm, borderTopRightRadius: RADIUS.sm },
  th: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  td: { fontSize: 12, color: COLORS.textPrimary },
  totalSection: { marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary },
  totalValue: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  grandTotalRow: { backgroundColor: COLORS.primaryLighter, borderRadius: RADIUS.sm, padding: 10, marginTop: 4 },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  grandTotalValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  totalInWordsBox: { marginTop: 10, backgroundColor: COLORS.background, borderRadius: RADIUS.sm, padding: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  totalInWordsLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  totalInWords: { fontSize: 12, color: COLORS.textPrimary, fontStyle: 'italic', lineHeight: 17 },
  signatureBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.divider },
  signatureLabel: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  signatureScript: { fontSize: 16, color: COLORS.textPrimary, fontStyle: 'italic' },
  signatureImg: { width: 80, height: 40 },
  stampPreview: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  stampPreviewText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  stampImg: { width: 50, height: 50 },
  actionBtns: { flexDirection: 'row', marginTop: SPACING.lg },
})
