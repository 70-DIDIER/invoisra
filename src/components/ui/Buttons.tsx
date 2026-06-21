import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, RADIUS } from '@/constants/colors'

interface ButtonProps {
  label: string
  onPress?: () => void
  icon?: keyof typeof Ionicons.glyphMap
  style?: ViewStyle
  disabled?: boolean
}

export function PrimaryButton({ label, onPress, icon, style, disabled }: ButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.base, styles.primary, disabled && styles.disabled, style]}>
      {icon && <Ionicons name={icon as any} size={18} color={COLORS.white} style={styles.iconLeft} />}
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  )
}

export function SecondaryButton({ label, onPress, icon, style, disabled }: ButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.base, styles.secondary, disabled && styles.disabled, style]}>
      {icon && <Ionicons name={icon as any} size={18} color={COLORS.primary} style={styles.iconLeft} />}
      <Text style={styles.secondaryText}>{label}</Text>
    </TouchableOpacity>
  )
}

export function OutlineButton({ label, onPress, icon, style, disabled }: ButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.base, styles.outline, disabled && styles.disabled, style]}>
      {icon && <Ionicons name={icon as any} size={18} color={COLORS.textPrimary} style={styles.iconLeft} />}
      <Text style={styles.outlineText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: RADIUS.md },
  iconLeft: { marginRight: 8 },
  primary: { backgroundColor: COLORS.primary },
  primaryText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  secondary: { backgroundColor: COLORS.primaryLighter },
  secondaryText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  outline: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  outlineText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
})
