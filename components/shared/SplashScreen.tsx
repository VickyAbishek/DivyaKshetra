// components/shared/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.lamp}>🪔</Text>
      <Text style={styles.title}>DivyaKshetra</Text>
      <Text style={styles.devanagari}>दिव्यक्षेत्र</Text>
      <Text style={styles.sub}>Sacred Places of India</Text>
      <View style={styles.divider} />
      <Text style={styles.loading}>Finding sacred places near you…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.sandalwood,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 100,
  },
  lamp: { fontSize: 52, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.deepEbony, fontFamily: 'serif' },
  devanagari: { fontSize: 16, color: colors.terracotta, letterSpacing: 2 },
  sub: { fontSize: 10, color: colors.terracotta, letterSpacing: 3, textTransform: 'uppercase', marginTop: -4 },
  divider: { width: 60, height: 1, backgroundColor: colors.sacredGold, marginVertical: 8 },
  loading: { fontSize: 10, color: colors.terracotta, letterSpacing: 1 },
});
