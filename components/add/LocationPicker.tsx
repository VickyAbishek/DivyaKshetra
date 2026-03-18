import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { colors } from '../../constants/colors';

const OSM_STYLE = JSON.stringify({
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
});

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  nearbyCount?: number;
};

export function LocationPicker({ lat, lng, onChange, nearbyCount = 0 }: Props) {
  const [pinCoord, setPinCoord] = useState<[number, number]>([lng, lat]);

  const handleDragEnd = (e: any) => {
    const [newLng, newLat] = e.geometry.coordinates;
    setPinCoord([newLng, newLat]);
    onChange(newLat, newLng);
  };

  return (
    <View>
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView style={StyleSheet.absoluteFill} styleJSON={OSM_STYLE}>
          <MapLibreGL.Camera centerCoordinate={pinCoord} zoomLevel={14} />
          <MapLibreGL.PointAnnotation
            id="new-place-pin"
            coordinate={pinCoord}
            draggable
            onDragEnd={handleDragEnd}
          >
            <View style={styles.pin}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        </MapLibreGL.MapView>
        <Text style={styles.dragHint}>✥ Drag pin to adjust</Text>
      </View>
      {nearbyCount > 0 && (
        <View style={styles.nearbyBanner}>
          <Text style={styles.nearbyText}>
            ⚠️ {nearbyCount} places already nearby. Please check they're not the same before adding.
          </Text>
        </View>
      )}
      <Text style={styles.helperText}>📍 Accurate location improves approval chances</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  pin: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.saffron,
    borderWidth: 3, borderColor: colors.sacredGold,
    alignItems: 'center', justifyContent: 'center',
  },
  dragHint: {
    position: 'absolute', bottom: 8, alignSelf: 'center',
    backgroundColor: 'rgba(28,15,8,0.75)',
    color: colors.sandalwood,
    fontSize: 9, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  nearbyBanner: {
    backgroundColor: 'rgba(255,243,205,0.92)',
    borderWidth: 1, borderColor: colors.sacredGold,
    borderRadius: 8, padding: 8, marginBottom: 10,
  },
  nearbyText: { fontSize: 10, color: colors.terracotta, lineHeight: 16 },
  helperText: { fontSize: 10, color: colors.saffron, marginBottom: 12 },
});
