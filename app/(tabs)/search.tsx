import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearch } from '../../hooks/useSearch';
import { SearchHeader, FilterKey } from '../../components/search/SearchHeader';
import { ResultRow } from '../../components/search/ResultRow';
import { RecentPills } from '../../components/search/RecentPills';
import { colors } from '../../constants/colors';

export default function SearchTab() {
  const router = useRouter();
  const { query, setQuery, results, recent, loading, saveRecent, removeRecent } = useSearch();
  const [filter, setFilter] = useState<FilterKey>('all');

  // Normalize sacred_water filter to match DB category value 'water' if needed
  const filtered = filter === 'all'
    ? results
    : results.filter((r) => {
        if (filter === 'sacred_water') return r.category === 'sacred_water' || r.category === 'water';
        return r.category === filter;
      });

  const countFor = (f: FilterKey) => {
    if (f === 'all') return results.length;
    if (f === 'sacred_water') return results.filter((r) => r.category === 'sacred_water' || r.category === 'water').length;
    return results.filter((r) => r.category === f).length;
  };

  const resultCounts: Partial<Record<FilterKey, number>> = {
    all:          countFor('all'),
    temple:       countFor('temple'),
    samadhi:      countFor('samadhi'),
    ashram:       countFor('ashram'),
    sacred_water: countFor('sacred_water'),
  };

  const handleSelect = (id: string) => {
    saveRecent(query);
    router.push(('/place/' + id) as any);
  };

  return (
    <View style={styles.container}>
      <SearchHeader
        query={query}
        onChangeQuery={setQuery}
        onClear={() => setQuery('')}
        activeFilter={filter}
        onFilterChange={setFilter}
        resultCounts={query.length >= 2 ? resultCounts : undefined}
        autoFocus
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.saffron} />
        </View>
      )}

      {!query && (
        <>
          <RecentPills recent={recent} onSelect={setQuery} onRemove={removeRecent} />
          <Text style={styles.sectionLabel}>Nearby Sacred Places</Text>
        </>
      )}

      {query.length >= 2 && !loading && (
        <Text style={styles.sectionLabel}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {filter !== 'all' ? ` for ${filter}` : ''}
        </Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResultRow result={item} query={query} onPress={() => handleSelect(item.id)} />
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>
              No results for "{query}". Know this place? Add it →
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sandalwood },
  loadingRow: { padding: 16, alignItems: 'center' },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.terracotta,
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4,
  },
  empty: { fontSize: 12, color: colors.terracotta, textAlign: 'center', padding: 30, lineHeight: 20 },
});
