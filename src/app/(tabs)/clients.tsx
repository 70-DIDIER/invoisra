import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getClients } from '@/lib/client'
import type { Client } from '@/lib/types'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')

  async function loadClients() {
    try {
      const res = await getClients(search || undefined)
      setClients(res.data)
    } catch { }
  }

  useFocusEffect(useCallback(() => { loadClients() }, [search]))

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
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
          <TouchableOpacity style={styles.clientCard} onPress={() => router.push(`/clients/${item.id}`)}>
            <View style={styles.clientIcon}>
              <Ionicons name="business-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientDetail}>{item.phone || item.email || 'Aucun contact'}</Text>
              <Text style={styles.clientCity}>{item.address?.split('\n')[0] || ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: { paddingHorizontal: SPACING.lg, paddingTop: 12, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.white },
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 10, marginTop: -12, marginBottom: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.textPrimary },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: COLORS.white, fontSize: 22, fontWeight: '600' },
  list: { padding: SPACING.lg, backgroundColor: COLORS.background, minHeight: '100%' },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 14 },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  clientIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLighter, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  clientDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  clientCity: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
})
