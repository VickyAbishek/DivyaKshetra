import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { useAddForm } from '../../lib/addFormStore';
import { colors } from '../../constants/colors';

export default function Step4() {
  const router = useRouter();
  const { form, setForm } = useAddForm();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader
        currentStep={4}
        totalSteps={5}
        title={form.editPlaceId ? 'Suggest an Edit' : 'Add Sacred Place'}
        label="Additional Details"
        onBack={() => router.back()}
        onCancel={() => router.dismissAll()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Tell us more</Text>
        <Text style={styles.sub}>All fields below are optional — share what you know.</Text>

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.description ?? ''}
          onChangeText={(t) => setForm({ description: t })}
          placeholder="History, significance, what makes this place special…"
          placeholderTextColor={colors.terracotta}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.fieldLabel}>Timings</Text>
        <TextInput
          style={styles.input}
          value={form.timings ?? ''}
          onChangeText={(t) => setForm({ timings: t })}
          placeholder="e.g. 6 AM – 12 PM, 4 PM – 8 PM"
          placeholderTextColor={colors.terracotta}
        />

        <Text style={styles.fieldLabel}>Entry & Offerings</Text>
        <TextInput
          style={styles.input}
          value={form.entryInfo ?? ''}
          onChangeText={(t) => setForm({ entryInfo: t })}
          placeholder="e.g. Free entry, dress code required"
          placeholderTextColor={colors.terracotta}
        />

        <Text style={styles.fieldLabel}>Best Time to Visit</Text>
        <TextInput
          style={styles.input}
          value={form.bestTime ?? ''}
          onChangeText={(t) => setForm({ bestTime: t })}
          placeholder="e.g. Winter months, Karthigai Deepam"
          placeholderTextColor={colors.terracotta}
        />

        <Text style={styles.micro}>More details = faster verification ✓</Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/add/step5-review' as any)}>
          <Text style={styles.ctaText}>Review Submission →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  sub: { fontSize: 10, color: colors.terracotta, marginBottom: 14, lineHeight: 16 },
  fieldLabel: {
    fontSize: 9, color: colors.terracotta, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 10,
  },
  input: {
    backgroundColor: colors.sandalwood, borderWidth: 1.5, borderColor: 'rgba(122,74,42,0.25)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 12, color: colors.deepEbony, marginBottom: 4,
  },
  textarea: { height: 88, textAlignVertical: 'top' },
  micro: { fontSize: 10, color: colors.verifiedGreen, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.sandalwood,
    borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)',
    padding: 10, paddingBottom: 28,
  },
  cta: { backgroundColor: colors.saffron, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
