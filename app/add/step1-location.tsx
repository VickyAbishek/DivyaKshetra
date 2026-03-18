import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { LocationPicker } from '../../components/add/LocationPicker';
import { useAddForm } from '../../lib/addFormStore';
import { colors } from '../../constants/colors';

export default function Step1() {
  const router = useRouter();
  const { form, setForm } = useAddForm();
  const { editPlaceId: editPlaceIdParam } = useLocalSearchParams<{ editPlaceId?: string }>();
  const lat = form.lat ?? 20.5937;
  const lng = form.lng ?? 78.9629;

  React.useEffect(() => {
    if (editPlaceIdParam || form.editPlaceId) {
      setForm({ editPlaceId: editPlaceIdParam });
      router.replace('/add/step2-info' as any);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader
        currentStep={1}
        totalSteps={5}
        title={form.editPlaceId ? 'Suggest an Edit' : 'Add Sacred Place'}
        label="Location"
        onBack={() => router.back()}
        onCancel={() => router.dismissAll()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Where is this place?</Text>
        <Text style={styles.sub}>Accurate placement improves approval chances.</Text>
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(la, lo) => setForm({ lat: la, lng: lo })}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/add/step2-info' as any)}>
          <Text style={styles.ctaText}>Confirm Location →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  sub: { fontSize: 10, color: colors.terracotta, marginBottom: 14, lineHeight: 16 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.sandalwood,
    borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)',
    padding: 10, paddingBottom: 28,
  },
  cta: { backgroundColor: colors.saffron, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
