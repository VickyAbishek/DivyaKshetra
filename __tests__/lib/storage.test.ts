import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceToken, saveSubmissionLocally, getLocalSubmissions } from '../../lib/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('getDeviceToken', () => {
  it('generates and persists a token on first call', async () => {
    const token = await getDeviceToken();
    expect(token).toHaveLength(36); // UUID v4
    const stored = await AsyncStorage.getItem('device_token');
    expect(stored).toBe(token);
  });

  it('returns the same token on subsequent calls', async () => {
    const t1 = await getDeviceToken();
    const t2 = await getDeviceToken();
    expect(t1).toBe(t2);
  });
});

describe('saveSubmissionLocally + getLocalSubmissions', () => {
  it('persists a submission and reads it back', async () => {
    const sub = { id: 'test-id', name: 'Test Temple', status: 'under_review' as const, createdAt: Date.now() };
    await saveSubmissionLocally(sub);
    const subs = await getLocalSubmissions();
    expect(subs).toHaveLength(1);
    expect(subs[0].name).toBe('Test Temple');
  });
});
