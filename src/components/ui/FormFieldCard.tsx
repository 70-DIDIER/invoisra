import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, RADIUS } from '@/constants/colors'

interface FormFieldCardProps {
  label: string
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  rightIcon?: keyof typeof Ionicons.glyphMap
  onPress?: () => void
  editable?: boolean
  multiline?: boolean
  style?: ViewStyle
}

export default function FormFieldCard({
  label, value, onChangeText, placeholder, rightIcon, onPress, editable = true, multiline = false, style,
}: FormFieldCardProps) {
  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {onPress ? (
          <Text style={styles.value}>{value}</Text>
        ) : (
          <TextInput
            style={[styles.value, styles.input, multiline && styles.inputMultiline]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            editable={editable}
            multiline={multiline}
          />
        )}
      </View>
      {rightIcon && <Ionicons name={rightIcon as any} size={18} color={COLORS.textSecondary} />}
    </View>
  )

  if (onPress) {
    return <TouchableOpacity activeOpacity={0.7} onPress={onPress}>{content}</TouchableOpacity>
  }
  return content
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  textWrap: { flex: 1 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  value: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  input: { padding: 0, margin: 0 },
  inputMultiline: { minHeight: 40, textAlignVertical: 'top' },
})
