import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type SearchResult = {
  id: string;
  name: string;
  category: string;
  deity?: string;
  district?: string;
  state?: string;
  lat: number;
  lng: number;
};

const RECENT_KEY = 'recent_searches';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => setRecent(raw ? JSON.parse(raw) : []));
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('places')
          .select('id, name, category, deity, district, state, lat, lng')
          .ilike('name', `%${query}%`)
          .limit(20);
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const saveRecent = async (q: string) => {
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const removeRecent = async (q: string) => {
    const updated = recent.filter((r) => r !== q);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  return { query, setQuery, results, recent, loading, saveRecent, removeRecent };
}
