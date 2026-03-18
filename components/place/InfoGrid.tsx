import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type InfoItem = { label: string; value: string };

export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    flex: 1, minWidth: '45%',
    backgroundColor: 'rgba(232,192,106,0.15)',
    borderWidth: 1, borderColor: 'rgba(232,192,106,0.35)',
    borderRadius: 8, padding: 8,
  },
  label: { fontSize: 9, color: colors.terracotta, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  value: { fontSize: 11, color: colors.deepEbony, fontWeight: '600' },
});
