import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { CategoryGrid } from '../../components/add/CategoryGrid';
import { useAddForm } from '../../lib/addFormStore';
import { colors } from '../../constants/colors';
import { CategoryKey } from '../../constants/categories';

export default function Step2() {
  const router = useRouter();
  const { editPlaceId } = useLocalSearchParams<{ editPlaceId?: string }>();
  const { form, setForm } = useAddForm();

  // If arriving from Suggest Edit, set editPlaceId in form
  React.useEffect(() => {
    if (editPlaceId && !form.editPlaceId) setForm({ editPlaceId });
  }, [editPlaceId]);

  const isValid = !!form.name && !!form.category;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader
        currentStep={form.editPlaceId ? 1 : 2}
        totalSteps={5}
        title={form.editPlaceId ? 'Suggest an Edit' : 'Add Sacred Place'}
        label="Basic Info"
        onBack={() => router.back()}
        onCancel={() => router.dismissAll()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>About this place</Text>

        <Text style={styles.fieldLabel}>Place Name *</Text>
        <TextInput
          style={styles.input}
          value={form.name ?? ''}
          onChangeText={(t) => setForm({ name: t })}
          placeholder="e.g. Palani Murugan Temple"
          placeholderTextColor={colors.terracotta}
        />

        <Text style={styles.fieldLabel}>Category *</Text>
        <CategoryGrid
          selected={form.category as CategoryKey | undefined}
          onSelect={(key) => setForm({ category: key })}
        />

        <Text style={styles.fieldLabel}>Deity / Spiritual Figure</Text>
        <TextInput
          style={styles.input}
          value={form.deity ?? ''}
          onChangeText={(t) => setForm({ deity: t })}
          placeholder="e.g. Lord Murugan (optional)"
          placeholderTextColor={colors.terracotta}
        />

        <Text style={styles.fieldLabel}>State / District</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={form.district ?? ''}
            onChangeText={(t) => setForm({ district: t })}
            placeholder="District"
            placeholderTextColor={colors.terracotta}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={form.state ?? ''}
            onChangeText={(t) => setForm({ state: t })}
            placeholder="State"
            placeholderTextColor={colors.terracotta}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !isValid && styles.ctaDisabled]}
          onPress={() => router.push('/add/step3-photos' as any)}
          disabled={!isValid}
        >
          <Text style={styles.ctaText}>Next: Add Photos →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 14 },
  fieldLabel: { fontSize: 9, color: colors.terracotta, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: colors.sandalwood, borderWidth: 1.5, borderColor: 'rgba(122,74,42,0.25)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, color: colors.deepEbony, marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.sandalwood,
    borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)',
    padding: 10, paddingBottom: 28,
  },
  cta: { backgroundColor: colors.saffron, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
