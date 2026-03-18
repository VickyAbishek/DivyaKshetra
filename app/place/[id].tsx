import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlace } from '../../hooks/usePlace';
import { HeroImage } from '../../components/place/HeroImage';
import { InfoGrid } from '../../components/place/InfoGrid';
import { PhotoStrip } from '../../components/place/PhotoStrip';
import { MapSnippet } from '../../components/place/MapSnippet';
import { CategoryBadge } from '../../components/shared/CategoryBadge';
import { colors } from '../../constants/colors';
import { CategoryKey } from '../../constants/categories';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { place, loading } = usePlace(id);
  const [heroIndex, setHeroIndex] = useState(0);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.sandalwood }} />;
  }
  if (!place) return null;

  const isVerified = !!place.verified_at;
  const isPending = place.status === 'pending';

  const infoItems = [
    place.timings    ? { label: 'Darshan Hours', value: place.timings }    : null,
    place.entry_info ? { label: 'Entry',         value: place.entry_info } : null,
    place.district   ? { label: 'Location',      value: `${place.district}${place.state ? ', ' + place.state : ''}` } : null,
    place.best_time  ? { label: 'Best Time',     value: place.best_time }  : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <ScrollView contentContainerStyle={styles.content}>
        <HeroImage
          photoUrls={place.photo_urls ?? []}
          isVerified={isVerified}
          onBack={() => router.back()}
          currentIndex={heroIndex}
          onDotPress={setHeroIndex}
        />

        <View style={styles.body}>
          {isPending && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>⏳ Under Community Review — details may change</Text>
            </View>
          )}

          <Text style={styles.name}>{place.name}</Text>
          {place.deity && <Text style={styles.deity}>{place.deity}</Text>}

          <View style={styles.metaRow}>
            <CategoryBadge category={place.category as CategoryKey} />
            {(place.district || place.state) && (
              <Text style={styles.location}>📍 {[place.district, place.state].filter(Boolean).join(', ')}</Text>
            )}
          </View>

          <MapSnippet lat={place.lat} lng={place.lng} name={place.name} />

          {place.description && (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{place.description}</Text>
            </>
          )}

          {infoItems.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Timings & Details</Text>
              <InfoGrid items={infoItems} />
            </>
          )}

          {(place.photo_urls?.length ?? 0) > 0 && (
            <>
              <Text style={styles.sectionTitle}>Photos</Text>
              <PhotoStrip
                photoUrls={place.photo_urls ?? []}
                onAddPhoto={isPending ? undefined : () => {/* photo upload — Task 6 */}}
              />
            </>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionSuggest, isPending && styles.actionDisabled]}
              disabled={isPending}
              onPress={() => router.push({ pathname: '/add/step2-info' as any, params: { editPlaceId: place.id } })}
              accessibilityLabel={isPending ? 'Edits paused during review' : 'Suggest an edit'}
            >
              <Text style={styles.actionSuggestText}>
                {isPending ? '✏️ Edits Paused During Review' : '✏️ Suggest Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionReport]}
              accessibilityLabel="Report an issue"
            >
              <Text style={styles.actionReportText}>⚑ Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Share.share({ message: `${place.name} — DivyaKshetra` })}
          accessibilityLabel="Share this place"
        >
          <Text style={{ fontSize: 16 }}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${place.lat},${place.lng}`)}
          accessibilityLabel={`Get directions to ${place.name}`}
        >
          <Text style={styles.directionText}>▶ Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  body: { padding: 14, paddingBottom: 100 },
  pendingBanner: {
    backgroundColor: 'rgba(255,243,205,0.9)',
    borderWidth: 1, borderColor: colors.sacredGold,
    borderRadius: 8, padding: 10, marginBottom: 12,
  },
  pendingText: { fontSize: 10, color: colors.terracotta, lineHeight: 16 },
  name: { fontSize: 18, fontWeight: 'bold', color: colors.deepEbony, fontFamily: 'serif', marginBottom: 4 },
  deity: { fontSize: 12, color: colors.terracotta, fontStyle: 'italic', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 14 },
  location: { fontSize: 10, color: colors.saffron, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.terracotta,
    marginBottom: 6, marginTop: 14,
  },
  description: { fontSize: 12, color: colors.templeBrown, lineHeight: 20, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionSuggest: {
    backgroundColor: 'rgba(192,84,26,0.12)',
    borderWidth: 1, borderColor: 'rgba(192,84,26,0.3)',
  },
  actionReport: {
    backgroundColor: 'rgba(122,74,42,0.08)',
    borderWidth: 1, borderColor: 'rgba(122,74,42,0.2)',
  },
  actionDisabled: { opacity: 0.5 },
  actionSuggestText: { fontSize: 10, fontWeight: '600', color: colors.saffron },
  actionReportText: { fontSize: 10, fontWeight: '600', color: colors.terracotta },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.sandalwood,
    borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.2)',
    padding: 10, paddingBottom: 28,
    flexDirection: 'row', gap: 8,
  },
  shareBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(232,192,106,0.2)',
    borderWidth: 1, borderColor: 'rgba(232,192,106,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  directionsBtn: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: colors.saffron,
    alignItems: 'center', justifyContent: 'center',
  },
  directionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
