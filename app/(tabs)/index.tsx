import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SpiritualMap } from '../../components/map/SpiritualMap';
import { PlaceBottomSheet } from '../../components/map/PlaceBottomSheet';
import { usePlaces, Place } from '../../hooks/usePlaces';
import { haversineKm } from '../../lib/geo';
import { colors } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';

export default function ExploreTab() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('temple');
  const { places } = usePlaces(userLocation?.lat ?? null, userLocation?.lng ?? null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync().then(({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      });
    });
  }, []);

  const filtered = activeCategory === 'all' ? places : places.filter((p) => p.category === activeCategory);

  const distanceToSelected = selectedPlace && userLocation
    ? haversineKm(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng)
    : null;

  return (
    <View style={styles.container}>
      {/* Floating search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search temples, deities, places…"
          placeholderTextColor={colors.terracotta}
          onFocus={() => router.push('/search' as any)}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}
      >
        {(['all', ...Object.keys(CATEGORIES)] as string[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, activeCategory === key && styles.chipActive]}
            onPress={() => setActiveCategory(key)}
          >
            <Text style={[styles.chipText, activeCategory === key && styles.chipTextActive]}>
              {key === 'all'
                ? '⭐ All'
                : `${CATEGORIES[key as keyof typeof CATEGORIES].emoji} ${CATEGORIES[key as keyof typeof CATEGORIES].label}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <SpiritualMap
        places={filtered}
        selectedId={selectedPlace?.id ?? null}
        onMarkerPress={setSelectedPlace}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />

      {/* Bottom sheet on marker tap */}
      {selectedPlace && (
        <PlaceBottomSheet
          place={selectedPlace}
          distanceKm={distanceToSelected}
          onViewDetails={() => router.push(`/place/${selectedPlace.id}` as any)}
          onDismiss={() => setSelectedPlace(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    position: 'absolute', top: 48, left: 12, right: 12, zIndex: 10,
    height: 42, backgroundColor: 'rgba(245,230,200,0.97)', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: colors.deepEbony },
  chips: { position: 'absolute', top: 98, left: 0, right: 0, zIndex: 10 },
  chip: { height: 28, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(245,230,200,0.92)', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.saffron },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.deepEbony },
  chipTextActive: { color: '#fff' },
});
