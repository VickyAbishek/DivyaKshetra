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
    setError(null);

    supabase
      .rpc('places_in_bbox', {
        min_lng: box.minLng,
        min_lat: box.minLat,
        max_lng: box.maxLng,
        max_lat: box.maxLat,
      })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setPlaces(data ?? []);
        setLoading(false);
      });
  }, [lat, lng, radiusKm]);

  return { places, loading, error };
}
