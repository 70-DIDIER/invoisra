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
  required?: boolean
  error?: string
}

export default function FormFieldCard({
  label, value, onChangeText, placeholder, rightIcon, onPress, editable = true, multiline = false, style, required, error,
}: FormFieldCardProps) {
  const content = (
    <View>
    <View style={[styles.card, error ? styles.cardError : undefined, style]}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}{required && <Text style={styles.required}> *</Text>}</Text>
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
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4,
  },
  cardError: { borderColor: COLORS.danger },
  textWrap: { flex: 1 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  required: { color: COLORS.danger },
  value: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  input: { padding: 0, margin: 0 },
  inputMultiline: { minHeight: 40, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: COLORS.danger, marginBottom: 12, marginTop: 2, marginLeft: 4 },
})
