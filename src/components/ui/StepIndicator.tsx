import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/colors'

export default function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isDone = step < currentStep
        const isActive = step === currentStep
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={[styles.circle, (isActive || isDone) && styles.circleActive]}>
              {isDone ? (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              ) : (
                <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{step}</Text>
              )}
            </View>
            {index < steps.length - 1 && <View style={[styles.dash, step < currentStep && styles.dashActive]} />}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  stepTextActive: { color: COLORS.white },
  dash: { width: 28, height: 1.5, backgroundColor: COLORS.border, marginHorizontal: 6 },
  dashActive: { backgroundColor: COLORS.primary },
})
