import { useState } from 'react'
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { createClient } from '@/lib/client'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'
import { StatusBar } from 'expo-status-bar'

export default function NewClientScreen() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setLoading(true); setError('')
    try {
      await createClient(form)
      router.back()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création")
    } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Retour</Text></TouchableOpacity>
        <Text style={styles.title}>Nouveau client</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Field label="Nom *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Nom complet" />
        <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} keyboard="email-address" placeholder="exemple@email.com" />
        <Field label="Téléphone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} keyboard="phone-pad" placeholder="Ex: +228 90 00 00 00" />
        <Field label="Adresse" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Ex: Lomé, Togo" />
        <Field label="Entreprise" value={form.company_name} onChange={v => setForm({ ...form, company_name: v })} placeholder="Nom de l'entreprise" />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({ label, value, onChange, keyboard, placeholder }: { label: string; value: string; onChange: (v: string) => void; keyboard?: any; placeholder?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} keyboardType={keyboard || 'default'} />
    </View>
  )
}

const styles = StyleSheet.create({
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
