import { renderHook, act } from '@testing-library/react-native';
import { useSearch } from '../../hooks/useSearch';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        ilike: () => ({
          limit: () => Promise.resolve({
            data: [{
              id: '1',
              name: 'Palani Murugan Temple',
              category: 'temple',
              district: 'Palani',
              state: 'Tamil Nadu',
              lat: 10.4,
              lng: 77.5,
            }],
            error: null,
          }),
        }),
      }),
    }),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

it('returns results matching a query', async () => {
  const { result } = renderHook(() => useSearch());
  act(() => { result.current.setQuery('muruga'); });
  await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
  expect(result.current.results.length).toBeGreaterThan(0);
  expect(result.current.results[0].name).toContain('Murugan');
});

it('clears results when query is empty', async () => {
  const { result } = renderHook(() => useSearch());
  act(() => { result.current.setQuery('muruga'); });
  await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
  act(() => { result.current.setQuery(''); });
  expect(result.current.results).toHaveLength(0);
});
