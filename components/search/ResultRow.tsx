import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';
import { SearchResult } from '../../hooks/useSearch';

type Props = {
  result: SearchResult;
  query: string;
  onPress: () => void;
};

// Normalize 'sacred_water' → 'water' to match CATEGORIES key
function resolveCategoryKey(category: string): keyof typeof CATEGORIES | undefined {
  if (category === 'sacred_water') return 'water';
  if (category in CATEGORIES) return category as keyof typeof CATEGORIES;
  return undefined;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <Text style={styles.name}>{text}</Text>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return <Text style={styles.name}>{text}</Text>;
  return (
    <Text style={styles.name}>
      {text.slice(0, idx)}
      <Text style={styles.highlight}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

export function ResultRow({ result, query, onPress }: Props) {
  const catKey = resolveCategoryKey(result.category);
  const cat = catKey ? CATEGORIES[catKey] : undefined;
  const location = [result.district, result.state].filter(Boolean).join(', ');
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.thumb, { backgroundColor: cat?.color ?? colors.terracotta }]}>
        <Text style={{ fontSize: 18 }}>{cat?.emoji ?? '📍'}</Text>
      </View>
      <View style={styles.info}>
        <HighlightedText text={result.name} query={query} />
        {location ? <Text style={styles.location}>{location}</Text> : null}
      </View>
      <Text style={styles.tag}>{cat?.label ?? result.category}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(122,74,42,0.1)' },
  thumb: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 12, color: colors.deepEbony, fontWeight: '600' },
  highlight: { color: colors.saffron, fontWeight: '700' },
  location: { fontSize: 10, color: colors.terracotta, marginTop: 2 },
  tag: { fontSize: 9, color: colors.terracotta, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
