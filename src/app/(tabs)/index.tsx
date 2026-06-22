import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar as RNStatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { getClients } from '@/lib/client'
import { getDocuments } from '@/lib/document'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [stats, setStats] = useState({ quotes: 0, invoices: 0 })
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  async function loadData() {
    try {
      const [clientsRes, docsRes] = await Promise.all([getClients(), getDocuments()])
      setStats({ quotes: docsRes.data.filter(d => d.type === 'quote').length, invoices: docsRes.data.filter(d => d.type === 'invoice').length })
      setRecentDocs(docsRes.data.slice(0, 3))
    } catch { }
  }

  useFocusEffect(useCallback(() => { loadData() }, []))

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingTop: Math.max(insets.top, RNStatusBar.currentHeight ?? 24), backgroundColor: COLORS.primary }}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name || 'Artisan'} 👋</Text>
          </View>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primaryLighter }]}>
            <Text style={styles.statNumber}>{stats.quotes}</Text>
            <Text style={styles.statLabel}>Devis</Text>
            <Text style={styles.statSubLabel}>au total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.accentYellowLight }]}>
            <Text style={[styles.statNumber, { color: '#B8860B' }]}>{stats.invoices}</Text>
            <Text style={styles.statLabel}>Factures</Text>
            <Text style={styles.statSubLabel}>au total</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <TouchableOpacity style={styles.primaryAction} activeOpacity={0.85} onPress={() => router.push('/documents/new')}>
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.primaryActionText}>Nouveau devis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.85} onPress={() => router.push('/documents/new?type=invoice')}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryActionText}>Nouvelle facture</Text>
        </TouchableOpacity>
        <View style={styles.docsHeaderRow}>
          <Text style={styles.sectionTitle}>Documents récents</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/documents')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        {recentDocs.length === 0 ? (
          <Text style={styles.emptyText}>Aucun document pour le moment</Text>
        ) : recentDocs.map((doc) => (
          <TouchableOpacity key={doc.id} style={styles.docCard} onPress={() => router.push(`/documents/${doc.id}`)}>
            <View>
              <Text style={styles.docTitle}>{(doc.type === 'quote' ? 'Devis' : 'Facture')} N°{doc.number}</Text>
              <Text style={styles.docSubtitle}>Client : {doc.client?.name || 'N/A'}</Text>
              <Text style={styles.docDate}>{new Date(doc.issue_date).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.pdfBadge}><Text style={styles.pdfBadgeText}>PDF</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  headerInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 12, paddingBottom: 28 },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  userName: { color: COLORS.white, fontSize: 20, fontWeight: '700', marginTop: 2 },
  body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, marginTop: -16 },
  bodyContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: 16 },
  statNumber: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4 },
  statSubLabel: { fontSize: 12, color: COLORS.textSecondary },
  primaryAction: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  primaryActionText: { color: COLORS.white, fontWeight: '700', fontSize: 15, marginLeft: 6 },
  secondaryAction: { flexDirection: 'row', backgroundColor: COLORS.primaryLighter, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  secondaryActionText: { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginLeft: 6 },
  docsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  docCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  docTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  docSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  docDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pdfBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  pdfBadgeText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '700' },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 20 },
})
