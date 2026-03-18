import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';

export function CategoryBadge({ category }: { category: CategoryKey }) {
  const c = CATEGORIES[category];
  return (
    <View style={[styles.badge, { backgroundColor: c.color }]}>
      <Text style={[styles.text, { color: c.textColor }]}>{c.emoji} {c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: '700' },
});
