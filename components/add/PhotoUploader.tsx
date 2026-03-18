import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';

type Props = { uris: string[]; onChange: (uris: string[]) => void };

export function PhotoUploader({ uris, onChange }: Props) {
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChange([...uris, result.assets[0].uri]);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.primary} onPress={pickImage} accessibilityLabel="Take a photo">
        <Text style={styles.primaryIcon}>📸</Text>
        <Text style={styles.primaryLabel}>Take a Photo</Text>
        <Text style={styles.primarySub}>Clear temple photos help faster approval</Text>
      </TouchableOpacity>
      <View style={styles.qualityHint}>
        <Text style={styles.qualityText}>
          ✓ Photos with clear view of the main entrance or shrine significantly improve approval chances.
        </Text>
      </View>
      <View style={styles.thumbRow}>
        {uris.map((uri, i) => (
          <View key={i} style={styles.thumbAdded}>
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={styles.thumbCheck}>
              <Text style={{ fontSize: 8, color: '#fff' }}>✓</Text>
            </View>
          </View>
        ))}
        {uris.length < 4 && (
          <TouchableOpacity style={styles.thumbAdd} onPress={pickImage} accessibilityLabel="Add another photo">
            <Text style={{ color: colors.terracotta, fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.saffron,
    borderRadius: 12, height: 130, alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 8, backgroundColor: 'rgba(192,84,26,0.06)',
  },
  primaryIcon: { fontSize: 32 },
  primaryLabel: { fontSize: 12, fontWeight: '700', color: colors.saffron },
  primarySub: { fontSize: 9, color: colors.terracotta, textAlign: 'center', paddingHorizontal: 20 },
  qualityHint: {
    backgroundColor: 'rgba(46,125,50,0.08)',
    borderWidth: 1, borderColor: 'rgba(46,125,50,0.25)',
    borderRadius: 8, padding: 8, marginBottom: 10,
  },
  qualityText: { fontSize: 10, color: '#2E7D32', lineHeight: 16 },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  thumbAdded: { width: 64, height: 54, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  thumbCheck: {
    position: 'absolute', top: -4, right: -4,
    width: 14, height: 14, backgroundColor: '#2E7D32',
    borderRadius: 7, alignItems: 'center', justifyContent: 'center',
  },
  thumbAdd: {
    width: 64, height: 54, borderRadius: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(122,74,42,0.35)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(122,74,42,0.05)',
  },
  skip: { fontSize: 10, color: colors.terracotta, textAlign: 'center', marginTop: 4 },
});
