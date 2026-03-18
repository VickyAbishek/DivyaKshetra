import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { boundingBox } from '../lib/geo';

export type Place = {
  id: string;
  name: string;
  category: 'temple' | 'samadhi' | 'ashram' | 'water';
  deity?: string;
  lat: number;
  lng: number;
  district?: string;
  state?: string;
  status: 'approved' | 'pending';
  verified_at?: string;
};

export function usePlaces(lat: number | null, lng: number | null, radiusKm = 50) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;
    const box = boundingBox(lat, lng, radiusKm);
    setLoading(true);
    supabase
      .from('places')
      .select('id, name, category, deity, district, state, status, verified_at, location')
      .gte('location', `POINT(${box.minLng} ${box.minLat})`)
      .lte('location', `POINT(${box.maxLng} ${box.maxLat})`)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setPlaces(
          (data ?? []).map((p: any) => ({
            ...p,
            lat: p.location?.coordinates?.[1] ?? 0,
            lng: p.location?.coordinates?.[0] ?? 0,
          }))
        );
        setLoading(false);
      });
  }, [lat, lng, radiusKm]);

  return { places, loading, error };
}
