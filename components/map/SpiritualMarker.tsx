import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';

type Props = { category: CategoryKey; selected?: boolean; dimmed?: boolean };

export function SpiritualMarker({ category, selected = false, dimmed = false }: Props) {
  const c = CATEGORIES[category];
  return (
    <View style={[styles.wrapper, dimmed && styles.dimmed]}>
      <View style={[
        styles.circle,
        { backgroundColor: c.color },
        selected && styles.selected,
      ]}>
        <Text style={styles.emoji}>{c.emoji}</Text>
      </View>
      <View style={[styles.stem, { backgroundColor: c.color }]} />
      <View style={styles.shadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  dimmed: { opacity: 0.4 },
  circle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2.5, borderColor: '#E8C06A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  selected: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#E8C06A', shadowOpacity: 0.5, shadowRadius: 8,
  },
  emoji: { fontSize: 16 },
  stem: { width: 2, height: 8 },
  shadow: { width: 8, height: 3, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
});
