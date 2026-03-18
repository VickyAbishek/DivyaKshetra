import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type PlaceDetail = {
  id: string;
  name: string;
  category: string;
  deity?: string;
  description?: string;
  lat: number;
  lng: number;
  district?: string;
  state?: string;
  timings?: string;
  entry_info?: string;
  best_time?: string;
  status: string;
  verified_at?: string;
  photo_urls?: string[];
};

export function usePlace(id: string) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPlace({
            ...data,
            lat: data.location?.coordinates?.[1] ?? 0,
            lng: data.location?.coordinates?.[0] ?? 0,
          });
        }
        setLoading(false);
      });
  }, [id]);

  return { place, loading };
}
