import React from 'react';
import { ScrollView, View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Props = { photoUrls: string[]; onAddPhoto?: () => void };

export function PhotoStrip({ photoUrls, onAddPhoto }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {photoUrls.map((uri, i) => (
        <Image key={i} source={{ uri }} style={styles.thumb} resizeMode="cover" />
      ))}
      {onAddPhoto && (
        <TouchableOpacity style={styles.addThumb} onPress={onAddPhoto} accessibilityLabel="Add photo">
          <Text style={styles.addText}>+</Text>
          <Text style={styles.addLabel}>Add</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingBottom: 2 },
  thumb: { width: 70, height: 60, borderRadius: 8 },
  addThumb: {
    width: 70, height: 60, borderRadius: 8,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.terracotta,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(122,74,42,0.05)', gap: 2,
  },
  addText: { color: colors.terracotta, fontSize: 16 },
  addLabel: { color: colors.terracotta, fontSize: 8 },
});
