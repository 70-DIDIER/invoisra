import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, RADIUS } from '@/constants/colors'
import { useEffect, useRef } from 'react'

export interface ModalButton {
  text: string
  onPress?: () => void
  primary?: boolean
}

interface AppModalProps {
  visible: boolean
  type?: 'success' | 'error' | 'info'
  title: string
  message?: string
  buttons?: ModalButton[]
  onClose?: () => void
}

export default function AppModal({ visible, type = 'info', title, message, buttons, onClose }: AppModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0)
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start()
    }
  }, [visible])

  const iconMap = {
    success: { name: 'checkmark-circle' as const, color: COLORS.success },
    error: { name: 'alert-circle' as const, color: COLORS.danger },
    info: { name: 'information-circle' as const, color: COLORS.primary },
  }

  const icon = iconMap[type]

  function handlePress(btn: ModalButton) {
    btn.onPress?.()
    onClose?.()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name={icon.name} size={48} color={icon.color} />
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          {buttons && buttons.length > 0 && (
            <View style={styles.btnRow}>
              {buttons.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.btn, btn.primary && styles.btnPrimary]}
                  onPress={() => handlePress(btn)}
                >
                  <Text style={[styles.btnText, btn.primary && styles.btnTextPrimary]}>{btn.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {(!buttons || buttons.length === 0) && (
            <TouchableOpacity style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]} onPress={onClose}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>OK</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    paddingHorizontal: 28, paddingVertical: 32,
    width: '82%', maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  title: {
    fontSize: 18, fontWeight: '700', color: COLORS.textPrimary,
    marginTop: 12, textAlign: 'center',
  },
  message: {
    fontSize: 14, color: COLORS.textSecondary,
    marginTop: 8, textAlign: 'center', lineHeight: 20,
  },
  btnRow: { marginTop: 20, width: '100%', gap: 8 },
  btn: {
    paddingVertical: 10, borderRadius: RADIUS.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  btnText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  btnTextPrimary: { color: COLORS.white },
})
