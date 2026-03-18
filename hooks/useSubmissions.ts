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
    const token = await getDeviceToken();
    const local = await getLocalSubmissions();

    if (local.length > 0) {
      const { data } = await supabase
        .from('submissions')
        .select('id, status, rejection_reason')
        .eq('device_token', token);

      for (const row of data ?? []) {
        const entry = local.find((s) => s.id === row.id);
        if (entry && entry.status !== row.status) {
          await updateLocalSubmissionStatus(row.id, row.status, row.rejection_reason);
        }
      }
    }

    setSubmissions(await getLocalSubmissions());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { submissions, loading, refresh };
}
