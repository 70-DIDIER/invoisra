import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { COLORS } from '@/constants/colors'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  onBackPress?: () => void
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightPress?: () => void
  variant?: 'green' | 'white'
  titleAlign?: 'center' | 'left'
}

export default function ScreenHeader({
  title,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  variant = 'green',
  titleAlign = 'center',
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()
  const isGreen = variant === 'green'
  const paddingTop = insets.top + 10

  return (
    <View style={[styles.container, { paddingTop, backgroundColor: isGreen ? COLORS.primary : COLORS.white }]}>
      <StatusBar style={isGreen ? 'light' : 'dark'} />
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress ?? (() => router.back())} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={24} color={isGreen ? COLORS.white : COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.title, { color: isGreen ? COLORS.white : COLORS.primary }, titleAlign === 'left' && styles.titleLeft]}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideRight]}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={rightIcon as any} size={22} color={isGreen ? COLORS.white : COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 32 },
  sideRight: { alignItems: 'flex-end' },
  title: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  titleLeft: { textAlign: 'left', fontSize: 22 },
})
