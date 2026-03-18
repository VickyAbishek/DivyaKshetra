import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Status = 'under_review' | 'approved' | 'rejected';

const CONFIG: Record<Status, { label: string; icon: string; bg: string; text: string; border: string }> = {
  under_review: { label: 'Under Review', icon: '⏳', bg: colors.reviewBg,   text: colors.reviewText,   border: colors.reviewBorder   },
  approved:     { label: 'Approved',      icon: '✓',  bg: colors.approvedBg, text: colors.approvedText, border: colors.approvedBorder },
  rejected:     { label: 'Not Approved',  icon: '✕',  bg: colors.rejectedBg, text: colors.rejectedText, border: colors.rejectedBorder },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>{c.icon} {c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
});
