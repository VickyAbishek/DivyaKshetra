import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  photoUrls?: string[];
  isVerified: boolean;
  onBack: () => void;
  currentIndex: number;
  onDotPress: (i: number) => void;
};

export function HeroImage({ photoUrls = [], isVerified, onBack, currentIndex, onDotPress }: Props) {
  const hasPhoto = photoUrls.length > 0;
  return (
    <View style={styles.hero}>
      {hasPhoto ? (
        <Image
          source={{ uri: photoUrls[currentIndex] }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Text style={{ fontSize: 60 }}>🛕</Text>
        </View>
      )}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityLabel="Go back">
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      {isVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Recently Verified</Text>
        </View>
      )}
      {photoUrls.length > 1 && (
        <View style={styles.dots}>
          {photoUrls.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => onDotPress(i)} accessibilityLabel={`Photo ${i + 1}`}>
              <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 210, backgroundColor: '#C0541A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 44, left: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 16 },
  verifiedBadge: {
    position: 'absolute', top: 44, right: 12,
    backgroundColor: 'rgba(46,125,50,0.9)', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 10, flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 16, borderRadius: 3, backgroundColor: '#fff' },
});
