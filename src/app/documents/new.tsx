import { useState, useCallback } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StepIndicator from '@/components/ui/StepIndicator'
import FormFieldCard from '@/components/ui/FormFieldCard'
import { PrimaryButton } from '@/components/ui/Buttons'
import { getClients } from '@/lib/client'
import { getCompany } from '@/lib/company'
import type { Client } from '@/lib/types'
import { COLORS, SPACING } from '@/constants/colors'
import AppModal from '@/components/ui/AppModal'

function cleanNotes(notes: string | null): string {
  if (!notes) return ''
  const idx = notes.indexOf('___FEES___')
  return idx >= 0 ? notes.substring(0, idx).trim() : notes.trim()
}

export default function NewDocumentStep1() {
  const params = useLocalSearchParams<{
    type?: string
    selectedClientId?: string
    selectedClientName?: string
    editId?: string
    issueDate?: string
    clientId?: string
    clientName?: string
    projectName?: string
    validUntil?: string
    notes?: string
    items?: string
    sousTotal?: string
    fees?: string
  }>()
  const [type] = useState(params.type === 'invoice' ? 'invoice' : 'quote')
  const [number, setNumber] = useState('')
  const [issueDate, setIssueDate] = useState(params.issueDate || new Date().toISOString().split('T')[0])
  const [client, setClient] = useState<{ id: number; name: string } | null>(
    params.clientId && params.clientName ? { id: parseInt(params.clientId), name: params.clientName } : null
  )
  const [projectName, setProjectName] = useState(params.projectName || '')
  const [validUntil, setValidUntil] = useState(params.validUntil || (() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })())
  const [notes, setNotes] = useState(cleanNotes(params.notes ?? null) || '')
  const [showPicker, setShowPicker] = useState<'issue' | 'validity' | null>(null)
  const [checking, setChecking] = useState(true)
  const [modal, setModal] = useState<{ visible: boolean; title: string; message: string; buttons?: { text: string; onPress?: () => void; primary?: boolean }[] }>({ visible: false, title: '', message: '' })

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (_event.type === 'dismissed' || !selectedDate) {
      setShowPicker(null)
      return
    }
    const formatted = selectedDate.toISOString().split('T')[0]
    if (showPicker === 'issue') setIssueDate(formatted)
    else setValidUntil(formatted)
    setShowPicker(null)
  }

  function parseDate(dateStr: string): Date {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? new Date() : d
  }

  useFocusEffect(useCallback(() => {
    let mounted = true
    setChecking(true)
    ;(async () => {
      try {
        await getCompany()
      } catch {
        if (!mounted) return
        setChecking(false)
        setModal({
          visible: true,
          title: 'Entreprise requise',
          message: 'Vous devez d\'abord configurer votre entreprise avant de créer un document.',
          buttons: [
            { text: 'Configurer', primary: true, onPress: () => router.push('/company/edit') },
            { text: 'Annuler', onPress: () => router.back() },
          ],
        })
        return
      }
      if (!params.editId) {
        if (params.clientId && params.clientName) {
          setClient({ id: parseInt(params.clientId), name: params.clientName })
        } else {
          getClients().then(res => {
            if (res.data.length > 0) {
              const c = res.data[0]
              setClient({ id: c.id, name: c.name })
            }
          }).catch(() => {})
        }
        const ts = Date.now().toString().slice(-5)
        setNumber(type === 'quote' ? `QTE-${ts}` : `INV-${ts}`)
      }
      if (mounted) setChecking(false)
    })()
    return () => { mounted = false }
  }, [params.selectedClientId, params.selectedClientName, params.editId]))

  function handleNext() {
    const data = {
      editId: params.editId,
      type, number, issueDate, validUntil,
      clientId: client?.id, clientName: client?.name,
      projectName, notes,
      items: params.items,
      sousTotal: params.sousTotal,
      fees: params.fees,
    }
    router.push({ pathname: '/documents/new-lignes', params: data as any })
  }

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScreenHeader title={params.editId ? 'Modifier le document' : type === 'quote' ? 'Nouveau devis' : 'Nouvelle facture'} showBack variant="white" />
      <StepIndicator currentStep={1} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg }} keyboardShouldPersistTaps="handled">
          <FormFieldCard label="Numéro" value={number} editable={false} />
          <FormFieldCard label="Date d'émission" value={issueDate} rightIcon="calendar-outline" onPress={() => setShowPicker('issue')} />
          <FormFieldCard
            label="Client"
            value={client?.name || 'Sélectionner...'}
            rightIcon="chevron-forward"
            onPress={() => router.push('/clients/select')}
          />
          <FormFieldCard label="Chantier / Projet" value={projectName} onChangeText={setProjectName} placeholder="Ex: Construction immeuble R+2" />
          <FormFieldCard label="Valable jusqu'au" value={validUntil} rightIcon="calendar-outline" onPress={() => setShowPicker('validity')} />
          <FormFieldCard label="Notes" value={notes} onChangeText={setNotes} placeholder="Description..." multiline />
          <View style={{ marginTop: SPACING.md }}>
            <PrimaryButton label="Suivant" onPress={handleNext} />
          </View>
        </ScrollView>
        {showPicker && (
          <DateTimePicker
            value={parseDate(showPicker === 'issue' ? issueDate : validUntil)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </KeyboardAvoidingView>
      <AppModal
        visible={modal.visible}
        type="info"
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  )
}
