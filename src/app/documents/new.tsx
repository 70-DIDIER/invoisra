import { useEffect, useState } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StepIndicator from '@/components/ui/StepIndicator'
import FormFieldCard from '@/components/ui/FormFieldCard'
import { PrimaryButton } from '@/components/ui/Buttons'
import { getClients } from '@/lib/client'
import type { Client } from '@/lib/types'
import { COLORS, SPACING } from '@/constants/colors'

export default function NewDocumentStep1() {
  const { type: initialType } = useLocalSearchParams<{ type?: string }>()
  const [type] = useState(initialType === 'invoice' ? 'invoice' : 'quote')
  const [number, setNumber] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [client, setClient] = useState<Client | null>(null)
  const [projectName, setProjectName] = useState('')
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await getClients()
        if (res.data.length > 0) setClient(res.data[0])
      } catch { }
    })()
    const ts = Date.now().toString().slice(-5)
    setNumber(type === 'quote' ? `QTE-${ts}` : `INV-${ts}`)
  }, [])

  function handleNext() {
    const data = {
      type, number, issueDate, validUntil,
      clientId: client?.id, clientName: client?.name,
      projectName, notes,
    }
    router.push({ pathname: '/documents/new-lignes', params: data as any })
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScreenHeader title={type === 'quote' ? 'Nouveau devis' : 'Nouvelle facture'} showBack variant="white" />
      <StepIndicator currentStep={1} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: SPACING.lg }} keyboardShouldPersistTaps="handled">
          <FormFieldCard label="Numéro" value={number} editable={false} />
          <FormFieldCard label="Date d'émission" value={issueDate} rightIcon="calendar-outline" />
          <FormFieldCard label="Client" value={client?.name || 'Sélectionner...'} rightIcon="chevron-forward" onPress={() => router.push('/(tabs)/clients')} />
          <FormFieldCard label="Chantier / Projet" value={projectName} onChangeText={setProjectName} placeholder="Ex: Construction immeuble R+2" />
          <FormFieldCard label="Valable jusqu'au" value={validUntil} rightIcon="calendar-outline" />
          <FormFieldCard label="Notes" value={notes} onChangeText={setNotes} placeholder="Description..." multiline />
          <View style={{ marginTop: SPACING.md }}>
            <PrimaryButton label="Suivant" onPress={handleNext} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
