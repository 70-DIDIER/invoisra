import { useRef, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS, RADIUS, SPACING } from '@/constants/colors'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon: 'document-text-outline' as const,
    title: 'Devis & Factures',
    description: 'Créez des devis et factures professionnels en quelques clics. Personnalisez vos documents avec votre logo et vos coordonnées.',
    color: COLORS.primary,
  },
  {
    icon: 'people-outline' as const,
    title: 'Gestion Clients',
    description: 'Gérez votre carnet d\'adresses clients facilement. Gardez l\'historique de tous vos échanges et documents.',
    color: '#2C3E50',
  },
  {
    icon: 'share-outline' as const,
    title: 'Export & Partage',
    description: 'Exportez en PDF et partagez vos documents par WhatsApp, Email, Telegram ou imprimez-les directement.',
    color: '#C0392B',
  },
]

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index ?? 0)
  }, [])

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  async function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
    } else {
      await AsyncStorage.setItem('onboarding-done', '1')
      router.replace('/welcome')
    }
  }

  function handleSkip() {
    AsyncStorage.setItem('onboarding-done', '1').then(() => {
      router.replace('/welcome')
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={56} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {currentIndex < SLIDES.length - 1 ? 'Suivant' : 'Commencer'}
          </Text>
          <Ionicons
            name={currentIndex < SLIDES.length - 1 ? 'arrow-forward' : 'checkmark'}
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: COLORS.white,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
})
