import { haversineKm, boundingBox } from '../../lib/geo';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(12.9716, 77.5946, 12.9716, 77.5946)).toBe(0);
  });

  it('calculates distance between Bangalore and Chennai (~290km)', () => {
    const km = haversineKm(12.9716, 77.5946, 13.0827, 80.2707);
    expect(km).toBeGreaterThan(280);
    expect(km).toBeLessThan(300);
  });
});

describe('boundingBox', () => {
  it('returns a box of ~1km radius around a point', () => {
    const box = boundingBox(12.9716, 77.5946, 1);
    // latDelta for 1km ≈ 0.009 degrees, total span ≈ 0.018
    expect(box.maxLat - box.minLat).toBeCloseTo(0.018, 2);
    expect(box.minLat).toBeLessThan(12.9716);
    expect(box.maxLat).toBeGreaterThan(12.9716);
    expect(box.minLng).toBeLessThan(77.5946);
    expect(box.maxLng).toBeGreaterThan(77.5946);
  });
});
