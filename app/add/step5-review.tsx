import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { useAddForm } from '../../lib/addFormStore';
import { supabase } from '../../lib/supabase';
import { getDeviceToken, saveSubmissionLocally } from '../../lib/storage';
import { colors } from '../../constants/colors';

export default function Step5() {
  const router = useRouter();
  const { form, reset } = useAddForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!form.editPlaceId;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const deviceToken = await getDeviceToken();

      if (isEditMode) {
        const { error: err } = await supabase.from('suggested_edits').insert({
          place_id: form.editPlaceId,
          device_token: deviceToken,
          changes: {
            name: form.name,
            deity: form.deity,
            description: form.description,
            timings: form.timings,
            entry_info: form.entryInfo,
          },
        });
        if (err) throw new Error(err.message);
      } else {
        const { data, error: err } = await supabase
          .from('submissions')
          .insert({
            device_token: deviceToken,
            name: form.name,
            category: form.category,
            deity: form.deity,
            description: form.description,
            lat: form.lat,
            lng: form.lng,
            district: form.district,
            state: form.state,
            timings: form.timings,
            entry_info: form.entryInfo,
            best_time: form.bestTime,
            photo_urls: form.photoUris ?? [],
          })
          .select('id')
          .single();

        if (err) throw new Error(err.message);
        if (data) {
          await saveSubmissionLocally({
            id: data.id,
            name: form.name!,
            category: form.category,
            status: 'under_review',
            createdAt: Date.now(),
          });
        }
      }

      reset();
      router.replace('/(tabs)/status' as any);
    } catch (e: any) {
      setError(e.message ?? 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const rows = [
    { key: 'Name',     val: form.name },
    { key: 'Category', val: form.category },
    { key: 'Deity',    val: form.deity },
    { key: 'Location', val: form.district ? `${form.district}${form.state ? ', ' + form.state : ''}` : undefined },
    { key: 'Photos',   val: (form.photoUris?.length ?? 0) > 0 ? `${form.photoUris!.length} photo(s)` : 'None added' },
  ].filter((r) => r.val);

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader
        currentStep={5}
        totalSteps={5}
        title={isEditMode ? 'Suggest an Edit' : 'Add Sacred Place'}
        label="Review"
        onBack={() => router.back()}
        onCancel={() => router.dismissAll()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Review your submission</Text>
        <Text style={styles.sub}>Our team will verify before it appears on the map.</Text>

        <View style={styles.reviewCard}>
          {rows.map((row) => (
            <View key={row.key} style={styles.reviewRow}>
              <Text style={styles.reviewKey}>{row.key}</Text>
              <Text style={styles.reviewVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <Text style={styles.disclaimer}>Your submission is anonymous.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>
              {isEditMode ? 'Submit Suggestion 🙏' : 'Submit for Review 🙏'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  sub: { fontSize: 10, color: colors.terracotta, marginBottom: 14, lineHeight: 16 },
  reviewCard: {
    backgroundColor: 'rgba(232,192,106,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,192,106,0.3)',
    borderRadius: 10, padding: 10, marginBottom: 10,
  },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: 'rgba(122,74,42,0.1)',
  },
  reviewKey: {
    fontSize: 10, color: colors.terracotta, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  reviewVal: {
    fontSize: 11, color: colors.deepEbony, fontWeight: '600',
    textAlign: 'right', maxWidth: '55%',
  },
  disclaimer: { fontSize: 10, color: colors.terracotta, textAlign: 'center', lineHeight: 16, paddingHorizontal: 8, marginTop: 8 },
  errorBanner: {
    backgroundColor: colors.rejectedBg,
    borderWidth: 1, borderColor: colors.rejectedBorder,
    borderRadius: 8, padding: 10, marginBottom: 10,
  },
  errorText: { fontSize: 11, color: colors.rejectedText, lineHeight: 16 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.sandalwood,
    borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)',
    padding: 10, paddingBottom: 28,
  },
  cta: { borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
