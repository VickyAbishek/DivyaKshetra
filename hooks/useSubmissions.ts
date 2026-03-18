import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  getDeviceToken,
  getLocalSubmissions,
  updateLocalSubmissionStatus,
  LocalSubmission,
} from '../lib/storage';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getDeviceToken();
      const local = await getLocalSubmissions();

      if (local.length > 0) {
        const { data, error } = await supabase
          .from('submissions')
          .select('id, status, rejection_reason')
          .eq('device_token', token);

        if (error) {
          console.warn('[useSubmissions] sync failed:', error.message);
        } else {
          for (const row of data ?? []) {
            const entry = local.find((s) => s.id === row.id);
            if (entry && entry.status !== row.status) {
              await updateLocalSubmissionStatus(row.id, row.status, row.rejection_reason);
            }
          }
        }
      }

      setSubmissions(await getLocalSubmissions());
    } catch (e) {
      console.error('[useSubmissions] refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { submissions, loading, refresh };
}
