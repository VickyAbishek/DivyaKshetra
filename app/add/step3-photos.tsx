import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { PhotoUploader } from '../../components/add/PhotoUploader';
import { useAddForm } from '../../lib/addFormStore';
import { colors } from '../../constants/colors';

export default function Step3() {
  const router = useRouter();
  const { form, setForm } = useAddForm();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader
        currentStep={3}
        totalSteps={5}
        title={form.editPlaceId ? 'Suggest an Edit' : 'Add Sacred Place'}
        label="Photos"
        onBack={() => router.back()}
        onCancel={() => router.dismissAll()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Add Photos</Text>
        <Text style={styles.sub}>Clear photos help our team verify your submission faster.</Text>
        <PhotoUploader
          uris={form.photoUris ?? []}
          onChange={(uris) => setForm({ photoUris: uris })}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/add/step4-details' as any)}>
          <Text style={styles.ctaText}>Next: More Details →</Text>
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
