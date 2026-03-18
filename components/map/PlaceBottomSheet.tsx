import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Place } from '../../hooks/usePlaces';
import { CategoryBadge } from '../shared/CategoryBadge';
import { colors } from '../../constants/colors';
import { CategoryKey } from '../../constants/categories';

type Props = { place: Place | null; distanceKm: number | null; onViewDetails: () => void; onDismiss: () => void };

export function PlaceBottomSheet({ place, distanceKm, onViewDetails, onDismiss }: Props) {
  if (!place) return null;
  const isVerified = !!place.verified_at;

  return (
    <BottomSheet snapPoints={['35%']} enablePanDownToClose onClose={onDismiss}>
      <BottomSheetView style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 40 }}>🛕</Text>
          </View>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Recently Verified</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{place.name}</Text>
        {place.deity && <Text style={styles.deity}>{place.deity}</Text>}
        <View style={styles.metaRow}>
          {distanceKm !== null && <Text style={styles.dist}>📍 {distanceKm.toFixed(1)} km away</Text>}
          <CategoryBadge category={place.category as CategoryKey} />
        </View>
        <TouchableOpacity style={styles.cta} onPress={onViewDetails} accessibilityLabel="View place details">
          <Text style={styles.ctaText}>View Details →</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, backgroundColor: colors.sandalwood },
  imageContainer: { width: '100%', height: 90, borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative' },
  imagePlaceholder: { flex: 1, backgroundColor: '#C0541A', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(46,125,50,0.9)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  name: { fontFamily: 'serif', fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  deity: { fontSize: 11, color: colors.terracotta, fontStyle: 'italic', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dist: { fontSize: 11, color: colors.saffron, fontWeight: '600' },
  cta: { backgroundColor: colors.saffron, borderRadius: 10, height: 38, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
