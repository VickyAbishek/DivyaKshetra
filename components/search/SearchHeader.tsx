import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export type FilterKey = 'all' | 'temple' | 'samadhi' | 'ashram' | 'sacred_water';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'All'          },
  { key: 'temple',       label: 'Temple'       },
  { key: 'samadhi',      label: 'Samadhi'      },
  { key: 'ashram',       label: 'Ashram'       },
  { key: 'sacred_water', label: 'Sacred Water' },
];

type Props = {
  query: string;
  onChangeQuery: (q: string) => void;
  onClear: () => void;
  activeFilter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
  resultCounts?: Partial<Record<FilterKey, number>>;
  autoFocus?: boolean;
};

export function SearchHeader({
  query,
  onChangeQuery,
  onClear,
  activeFilter,
  onFilterChange,
  resultCounts,
  autoFocus,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search temples, deities, places…"
          placeholderTextColor={colors.terracotta}
          autoFocus={autoFocus}
          returnKeyType="search"
          accessibilityLabel="Search input"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn} accessibilityLabel="Clear search">
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          const count = resultCounts?.[f.key];
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onFilterChange(f.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}{active && count !== undefined ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.deepEbony, paddingTop: 52, paddingBottom: 8, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.sandalwood, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, height: 40 },
  input: { flex: 1, fontSize: 13, color: colors.deepEbony },
  clearBtn: { paddingLeft: 8 },
  clearText: { fontSize: 11, color: colors.terracotta },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,230,200,0.25)' },
  chipActive: { backgroundColor: colors.sacredGold, borderColor: colors.sacredGold },
  chipText: { fontSize: 11, color: 'rgba(245,230,200,0.7)', fontWeight: '600' },
  chipTextActive: { color: colors.deepEbony, fontWeight: '700' },
});
