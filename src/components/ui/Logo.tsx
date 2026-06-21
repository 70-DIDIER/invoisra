import { Image, View, StyleSheet } from 'react-native'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 32, md: 48, lg: 72 }

export default function Logo({ size = 'md' }: LogoProps) {
  const dim = sizeMap[size]
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={{ width: dim, height: dim, resizeMode: 'contain' }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
})
