import { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getClients } from '@/lib/client'
import type { Client } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function ClientSelectScreen() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function loadClients(query?: string) {
    try {
      const res = await getClients(query || undefined)
      setClients(res.data)
    } catch { }
  }

  useFocusEffect(useCallback(() => { loadClients() }, []))

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => loadClients(search), 400)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [search])

  function selectClient(client: Client) {
    router.navigate({
      pathname: '/documents/new',
      params: {
        selectedClientId: client.id.toString(),
        selectedClientName: client.name,
      },
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Annuler</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Sélectionner un client</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/clients/new')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={clients}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucun client trouvé</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.clientCard} onPress={() => selectClient(item)}>
            <View style={styles.clientIcon}>
              <Ionicons name="business-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientDetail}>{item.phone || item.email || 'Aucun contact'}</Text>
            </View>
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: SPACING.lg, paddingTop: 12, paddingBottom: 16 },
  backBtn: { color: COLORS.white, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 10, marginBottom: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.textPrimary },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: COLORS.primary, fontSize: 22, fontWeight: '600' },
  list: { padding: SPACING.lg, backgroundColor: COLORS.background, minHeight: '100%' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 14 },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  clientIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLighter, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  clientDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
})
