import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Place } from '../../hooks/usePlaces';
import { SpiritualMarker } from './SpiritualMarker';
import { CategoryKey } from '../../constants/categories';

MapLibreGL.setAccessToken(null); // OSM — no token needed

const OSM_STYLE = JSON.stringify({
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
});

type Props = {
  places: Place[];
  selectedId: string | null;
  onMarkerPress: (place: Place) => void;
  userLat?: number;
  userLng?: number;
};

export function SpiritualMap({ places, selectedId, onMarkerPress, userLat = 20.5937, userLng = 78.9629 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView style={StyleSheet.absoluteFill} styleJSON={OSM_STYLE}>
        <MapLibreGL.Camera centerCoordinate={[userLng, userLat]} zoomLevel={10} />
        {places.map((place) => (
          <MapLibreGL.MarkerView
            key={place.id}
            coordinate={[place.lng, place.lat]}
            onPress={() => onMarkerPress(place)}
          >
            <SpiritualMarker
              category={place.category as CategoryKey}
              selected={place.id === selectedId}
              dimmed={selectedId !== null && place.id !== selectedId}
            />
          </MapLibreGL.MarkerView>
        ))}
      </MapLibreGL.MapView>
    </View>
  );
}
