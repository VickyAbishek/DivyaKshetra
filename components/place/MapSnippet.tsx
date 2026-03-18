import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Linking } from 'react-native';
import { colors } from '../../constants/colors';

export function MapSnippet({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const openMaps = () => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  return (
    <TouchableOpacity style={styles.container} onPress={openMaps} accessibilityLabel={`Navigate to ${name}`}>
      <View style={styles.mapBg}>
        <Text style={{ fontSize: 24 }}>📍</Text>
      </View>
      <View style={styles.navBtn}>
        <Text style={styles.navText}>▶ Navigate</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%', height: 80, borderRadius: 10, overflow: 'hidden',
    marginBottom: 14, position: 'relative', backgroundColor: '#C8A87A',
  },
  mapBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navBtn: {
    position: 'absolute', bottom: 6, right: 8,
    backgroundColor: colors.saffron, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  navText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
