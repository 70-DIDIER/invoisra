import { useEffect, useState } from 'react'
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { getClient, updateClient } from '@/lib/client'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const client = await getClient(Number(id))
        setForm({
          name: client.name, email: client.email || '', phone: client.phone || '',
          address: client.address || '', company_name: client.company_name || '',
        })
      } catch { setError('Client introuvable') }
      finally { setLoading(false) }
    })()
  }, [id])

  async function handleSave() {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setSaving(true); setError('')
    try {
      await updateClient(Number(id), form)
      router.back()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour")
    } finally { setSaving(false) }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Retour</Text></TouchableOpacity>
        <Text style={styles.title}>Modifier le client</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Field label="Nom *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
        <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        <Field label="Téléphone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
        <Field label="Adresse" value={form.address} onChange={v => setForm({ ...form, address: v })} />
        <Field label="Entreprise" value={form.company_name} onChange={v => setForm({ ...form, company_name: v })} />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholderTextColor={COLORS.textMuted} />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SPACING.lg },
  error: { color: COLORS.danger, textAlign: 'center', marginBottom: SPACING.md, fontSize: 13 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, padding: 12, borderRadius: RADIUS.md, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
})
