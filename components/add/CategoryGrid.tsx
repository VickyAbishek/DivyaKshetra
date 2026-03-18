import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';
import { colors } from '../../constants/colors';

type Props = { selected?: CategoryKey; onSelect: (key: CategoryKey) => void };

export function CategoryGrid({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(([key, cat]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.option,
            selected === key && { borderColor: colors.saffron, backgroundColor: 'rgba(192,84,26,0.08)' },
          ]}
          onPress={() => onSelect(key)}
          accessibilityLabel={`Select ${cat.label} category`}
        >
          <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
          <Text style={[styles.label, selected === key && { color: colors.saffron }]}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  option: {
    flex: 1, minWidth: '45%', height: 52, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(122,74,42,0.2)',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  label: { fontSize: 9, color: colors.terracotta, fontWeight: '600' },
});
