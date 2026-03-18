import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Props = {
  currentStep: number;
  totalSteps: number;
  title: string;
  label: string;
  onBack: () => void;
  onCancel: () => void;
};

export function StepHeader({ currentStep, totalSteps, title, label, onBack, onCancel }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} accessibilityLabel="Go back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentStep - 1 && styles.dotDone,
              i === currentStep - 1 && styles.dotActive,
              i >= currentStep && styles.dotTodo,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step {currentStep} of {totalSteps} — {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.deepEbony, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { color: colors.sacredGold, fontSize: 18 },
  title: { color: colors.sandalwood, fontFamily: 'serif', fontSize: 13, fontWeight: 'bold' },
  cancel: { color: colors.terracotta, fontSize: 10 },
  dots: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  dotDone: { backgroundColor: colors.sacredGold },
  dotActive: { flex: 2, backgroundColor: colors.saffron },
  dotTodo: { backgroundColor: 'rgba(255,255,255,0.15)' },
  stepLabel: { color: colors.terracotta, fontSize: 9, letterSpacing: 0.5 },
});
