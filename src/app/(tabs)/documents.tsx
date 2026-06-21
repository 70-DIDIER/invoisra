import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getDocuments } from '@/lib/document'
import type { Document } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function DocumentsScreen() {
  const [docs, setDocs] = useState<Document[]>([])
  const [tab, setTab] = useState<'quotes' | 'invoices'>('quotes')
  const [search, setSearch] = useState('')

  async function loadDocs() {
    try {
      const res = await getDocuments({ type: tab === 'quotes' ? 'quote' : 'invoice' })
      setDocs(res.data)
    } catch { }
  }

  useFocusEffect(useCallback(() => { loadDocs() }, [tab]))

  const filtered = docs.filter(d =>
    !search || d.number.toLowerCase().includes(search.toLowerCase()) ||
    d.client?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes documents</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.tabRow}>
        {['Devis', 'Factures'].map((t, i) => {
          const isActive = (i === 0 && tab === 'quotes') || (i === 1 && tab === 'invoices')
          return (
            <TouchableOpacity key={t} style={[styles.tab, isActive && styles.tabActive]} onPress={() => setTab(i === 0 ? 'quotes' : 'invoices')}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t}</Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          )
        })}
        <View style={styles.tabRight} />
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucun document trouvé</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.docCard} onPress={() => router.push(`/documents/${item.id}`)}>
            <View>
              <Text style={styles.docNumber}>{(tab === 'quotes' ? 'Devis' : 'Facture')} N°{item.number}</Text>
              <Text style={styles.docClient}>Client : {item.client?.name || 'N/A'}</Text>
              <Text style={styles.docDate}>{new Date(item.issue_date).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={styles.pdfBadge}><Text style={styles.pdfBadgeText}>PDF</Text></View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, backgroundColor: COLORS.primary },
  tab: { paddingVertical: 10, marginRight: 24, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: COLORS.white, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  tabRight: { flex: 1 },
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: 10, backgroundColor: COLORS.white, gap: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 8 },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 13, color: COLORS.textPrimary },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.lg, backgroundColor: COLORS.background, minHeight: '100%' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 14 },
  docCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  docNumber: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  docClient: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  docDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pdfBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  pdfBadgeText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '700' },
})
