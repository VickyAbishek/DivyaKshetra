import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Props = {
  recent: string[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
};

export function RecentPills({ recent, onSelect, onRemove }: Props) {
  if (recent.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Recent Searches</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {recent.map((q) => (
          <View key={q} style={styles.pill}>
            <TouchableOpacity onPress={() => onSelect(q)}>
              <Text style={styles.pillText}>{q}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRemove(q)} style={styles.x} accessibilityLabel={`Remove ${q}`}>
              <Text style={styles.xText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 14, paddingTop: 12 },
  label: { fontSize: 10, fontWeight: '700', color: colors.terracotta, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  row: { gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(61,32,16,0.08)', borderRadius: 20, paddingLeft: 12, paddingRight: 6, paddingVertical: 6 },
  pillText: { fontSize: 11, color: colors.deepEbony, marginRight: 4 },
  x: { paddingHorizontal: 4 },
  xText: { fontSize: 9, color: colors.terracotta },
});
