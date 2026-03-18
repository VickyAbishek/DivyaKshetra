import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubmissions } from '../../hooks/useSubmissions';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { getDeviceToken, getSubmissionCode } from '../../lib/storage';
import { colors } from '../../constants/colors';
import { LocalSubmission } from '../../lib/storage';

export default function StatusTab() {
  const router = useRouter();
  const { submissions, loading, refresh } = useSubmissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    getDeviceToken().then((token) => setCode(getSubmissionCode(token)));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.sandalwood, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.saffron} />
      </View>
    );
  }

  if (submissions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🙏</Text>
        <Text style={styles.emptyTitle}>No submissions yet</Text>
        <Text style={styles.emptyBody}>
          Know a temple, samadhi, or ashram that's not on the map? Help the community discover it.
        </Text>
        <TouchableOpacity
          style={styles.addCta}
          onPress={() => router.push('/add/step1-location' as any)}
        >
          <Text style={styles.addCtaText}>+ Add a Sacred Place</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      {/* Dark nav header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Submissions</Text>
        <Text style={styles.headerSub}>Stored on this device · No account needed</Text>
      </View>

      {/* Recovery code banner */}
      {code && (
        <View style={styles.codeBanner}>
          <Text style={styles.codeBannerText}>
            📱 Your submissions are stored on this device.{' '}
            Recovery code: <Text style={styles.codeValue}>{code}</Text>
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {submissions.map((sub) => (
          <SubmissionCard
            key={sub.id}
            sub={sub}
            expanded={expandedId === sub.id}
            onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            onResubmit={() => router.push('/add/step1-location' as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type CardProps = {
  sub: LocalSubmission;
  expanded: boolean;
  onToggle: () => void;
  onResubmit: () => void;
};

function SubmissionCard({ sub, expanded, onToggle, onResubmit }: CardProps) {
  const date = new Date(sub.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onToggle} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <View style={styles.cardThumb}>
          <Text style={{ fontSize: 22 }}>🛕</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{sub.name}</Text>
          <Text style={styles.cardMeta}>{sub.category ?? 'Unknown'} · {date}</Text>
        </View>
        <View style={styles.cardRight}>
          <StatusBadge status={sub.status} />
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expanded}>
          {sub.status === 'approved' && (
            <View style={styles.approvedMsg}>
              <Text style={styles.approvedText}>
                ✓ Your submission is now live on the map. Thank you for contributing to DivyaKshetra!
              </Text>
            </View>
          )}
          {sub.status === 'under_review' && (
            <View style={styles.reviewMsg}>
              <Text style={styles.reviewText}>
                ⏳ Your submission is being reviewed by the community team.
              </Text>
            </View>
          )}
          {sub.status === 'rejected' && (
            <>
              {sub.rejectionReason && (
                <View style={styles.rejectionMsg}>
                  <Text style={styles.rejectionLabel}>Why it wasn't approved:</Text>
                  <Text style={styles.rejectionText}>{sub.rejectionReason}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.resubmitBtn} onPress={onResubmit}>
                <Text style={styles.resubmitText}>↺ Resubmit with More Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.deepEbony,
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14,
  },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: colors.sandalwood, fontFamily: 'serif' },
  headerSub: { fontSize: 9, color: colors.terracotta, marginTop: 2 },
  codeBanner: {
    backgroundColor: 'rgba(232,192,106,0.15)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(232,192,106,0.25)',
    padding: 10,
  },
  codeBannerText: { fontSize: 10, color: colors.terracotta, lineHeight: 16 },
  codeValue: { fontWeight: '700', color: colors.deepEbony, letterSpacing: 1.5 },
  list: { padding: 12, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(122,74,42,0.15)',
    padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardThumb: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(192,84,26,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 12, fontWeight: 'bold', color: colors.deepEbony, fontFamily: 'serif' },
  cardMeta: { fontSize: 9, color: colors.terracotta, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  chevron: { fontSize: 9, color: colors.terracotta },
  expanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.1)' },
  approvedMsg: {
    backgroundColor: colors.approvedBg, borderRadius: 8,
    borderWidth: 1, borderColor: colors.approvedBorder, padding: 8,
  },
  approvedText: { fontSize: 10, color: colors.approvedText, lineHeight: 16 },
  reviewMsg: {
    backgroundColor: colors.reviewBg, borderRadius: 8,
    borderWidth: 1, borderColor: colors.reviewBorder, padding: 8,
  },
  reviewText: { fontSize: 10, color: colors.reviewText, lineHeight: 16 },
  rejectionMsg: {
    backgroundColor: colors.rejectedBg, borderRadius: 8,
    borderWidth: 1, borderColor: colors.rejectedBorder, padding: 8, marginBottom: 8,
  },
  rejectionLabel: { fontSize: 9, color: colors.rejectedText, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
  rejectionText: { fontSize: 10, color: colors.rejectedText, lineHeight: 16 },
  resubmitBtn: {
    backgroundColor: colors.saffron, borderRadius: 8,
    height: 32, alignItems: 'center', justifyContent: 'center',
  },
  resubmitText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  emptyContainer: {
    flex: 1, backgroundColor: colors.sandalwood,
    alignItems: 'center', justifyContent: 'center', padding: 30,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, fontFamily: 'serif', marginBottom: 8 },
  emptyBody: { fontSize: 11, color: colors.terracotta, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  addCta: {
    backgroundColor: colors.saffron, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  addCtaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
