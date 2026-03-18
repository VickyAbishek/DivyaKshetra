import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_TOKEN_KEY = 'device_token';
const SUBMISSIONS_KEY = 'local_submissions';

function generateUUID(): string {
  // RFC 4122 v4 UUID — works in React Native without native modules
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function getDeviceToken(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = generateUUID();
  await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

export function getSubmissionCode(token: string): string {
  return token.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export type LocalSubmission = {
  id: string;
  name: string;
  category?: string;
  status: 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: number;
};

export async function saveSubmissionLocally(sub: LocalSubmission): Promise<void> {
  const existing = await getLocalSubmissions();
  const updated = [sub, ...existing.filter((s) => s.id !== sub.id)];
  await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
}

export async function getLocalSubmissions(): Promise<LocalSubmission[]> {
  const raw = await AsyncStorage.getItem(SUBMISSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function updateLocalSubmissionStatus(
  id: string,
  status: LocalSubmission['status'],
  rejectionReason?: string
): Promise<void> {
  const subs = await getLocalSubmissions();
  const updated = subs.map((s) => (s.id === id ? { ...s, status, rejectionReason } : s));
  await AsyncStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
}
