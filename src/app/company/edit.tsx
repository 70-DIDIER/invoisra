import { useEffect, useState } from 'react'
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { getCompany, createCompany, updateCompany } from '@/lib/company'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

export default function CompanyEditScreen() {
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', manager_name: '' })
  const [hasCompany, setHasCompany] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const c = await getCompany()
        setHasCompany(true)
        setForm({ name: c.name, address: c.address || '', phone: c.phone || '', email: c.email || '', manager_name: c.manager_name || '' })
      } catch { }
      finally { setLoading(false) }
    })()
  }, [])

  async function handleSave() {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    if (!form.phone.trim()) { setError('Le téléphone est requis'); return }
    if (!form.address.trim()) { setError('L\'adresse est requise'); return }
    setSaving(true); setError('')
    try {
      if (hasCompany) await updateCompany(form)
      else await createCompany(form)
      router.back()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement")
    } finally { setSaving(false) }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Retour</Text></TouchableOpacity>
        <Text style={styles.title}>{hasCompany ? 'Modifier' : 'Configurer'} l'entreprise</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Field label="Nom *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
        <Field label="Adresse *" value={form.address} onChange={v => setForm({ ...form, address: v })} />
        <Field label="Téléphone *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
        <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} keyboard="email-address" />
        <Field label="Gérant" value={form.manager_name} onChange={v => setForm({ ...form, manager_name: v })} />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({ label, value, onChange, keyboard }: { label: string; value: string; onChange: (v: string) => void; keyboard?: any }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholderTextColor={COLORS.textMuted} keyboardType={keyboard || 'default'} />
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
