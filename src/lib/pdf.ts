import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { downloadDocumentPdf, sendDocumentEmail } from './document'

export async function downloadPdf(documentId: number): Promise<File> {
  const { content, filename } = await downloadDocumentPdf(documentId)
  const file = new File(Paths.cache, filename)
  await file.write(content, { encoding: 'base64' })
  return file
}

export async function sharePdf(documentId: number) {
  const file = await downloadPdf(documentId)
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Partager le document',
  })
}

export async function shareViaWhatsApp(documentId: number) {
  if (Platform.OS === 'web') return
  const file = await downloadPdf(documentId)
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Partager sur WhatsApp',
  })
}

export async function shareViaTelegram(documentId: number) {
  if (Platform.OS === 'web') return
  const file = await downloadPdf(documentId)
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Partager sur Telegram',
  })
}

export async function shareViaEmail(documentId: number, email?: string) {
  if (email) {
    try {
      await sendDocumentEmail(documentId, email)
      return
    } catch {}
  }
  await sharePdf(documentId)
}
