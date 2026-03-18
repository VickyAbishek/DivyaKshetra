# DivyaKshetra Mobile App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DivyaKshetra React Native (Expo) mobile app — a zero-login, community-driven spiritual map of India — across five vertical slices: foundation, core map experience, place details, contribution flow, and search/discovery.

**Architecture:** Expo Router for file-based navigation, MapLibre React Native for OSM map rendering, Supabase for backend (places + submissions), AsyncStorage for on-device submission tracking. Each screen is a focused component pulling from a thin data layer — no global state manager, just React context for design tokens and a small set of custom hooks.

**Tech Stack:** Expo SDK 52+, Expo Router v3, `@maplibre/maplibre-react-native`, `@supabase/supabase-js`, `react-native-bottom-sheet`, `expo-image-picker`, AsyncStorage, Jest + `@testing-library/react-native`

---

## File Map

```
app/
  _layout.tsx               # Root layout — tab navigator (Explore / Search / Add / Status)
  (tabs)/
    index.tsx               # Home — Map view
    search.tsx              # Search & Discovery
    add.tsx                 # Add New Place (entry, redirects to step 1)
    status.tsx              # Submission Status
  place/[id].tsx            # Place Details (push screen)
  add/
    step1-location.tsx      # Add flow: Step 1 — Location
    step2-info.tsx          # Add flow: Step 2 — Basic Info
    step3-photos.tsx        # Add flow: Step 3 — Photos
    step4-details.tsx       # Add flow: Step 4 — Additional Details
    step5-review.tsx        # Add flow: Step 5 — Review & Submit

components/
  map/
    SpiritualMap.tsx        # MapLibre map wrapper with OSM tiles
    SpiritualMarker.tsx     # Custom per-category pin component
    PlaceBottomSheet.tsx    # Half-sheet preview on marker tap
  place/
    HeroImage.tsx           # Hero photo + carousel dots + back button
    InfoGrid.tsx            # 2×2 timings/detail card grid
    PhotoStrip.tsx          # Horizontal photo thumbnail row
    MapSnippet.tsx          # Mini map with navigate CTA
  add/
    StepHeader.tsx          # Progress bar + step label (shared across all steps)
    LocationPicker.tsx      # MapLibre pin-drop for step 1
    CategoryGrid.tsx        # 2×2 category selector
    PhotoUploader.tsx       # Camera-first photo CTA + thumbs
  search/
    SearchHeader.tsx        # Search input + filter chips (sticky)
    ResultRow.tsx           # Single result row with highlighted match
    RecentPills.tsx         # Dismissible recent-search pills
  shared/
    StatusBadge.tsx         # Under Review / Approved / Not Approved badge
    CategoryBadge.tsx       # Coloured category pill (Temple / Samadhi / etc.)
    SplashScreen.tsx        # Animated splash (lamp + shimmer)

hooks/
  usePlaces.ts              # Fetch places from Supabase (nearby + by category)
  usePlace.ts               # Fetch single place by ID
  useSearch.ts              # Typeahead + results query
  useSubmissions.ts         # Read/write local submissions (AsyncStorage)
  useSubmissionToken.ts     # Generate/persist UUID v4 device token

lib/
  supabase.ts               # Supabase client (singleton)
  storage.ts                # AsyncStorage keys + helpers
  geo.ts                    # Haversine distance, bounding box helpers

constants/
  colors.ts                 # Design token palette
  categories.ts             # Category metadata (emoji, label, colour)

__tests__/
  hooks/
    useSubmissions.test.ts
    useSubmissionToken.test.ts
    useSearch.test.ts
  components/
    StatusBadge.test.tsx
    CategoryBadge.test.tsx
    StepHeader.test.tsx
  lib/
    geo.test.ts
    storage.test.ts
```

---

## Task 1: Project Scaffold + Design Tokens

**Files:**
- Create: `package.json` (via `npx create-expo-app`)
- Create: `constants/colors.ts`
- Create: `constants/categories.ts`
- Create: `app/_layout.tsx`
- Create: `__tests__/lib/geo.test.ts`
- Create: `lib/geo.ts`

- [ ] **Step 1: Scaffold Expo project**

```bash
npx create-expo-app@latest DivyaKshetra --template blank-typescript
cd DivyaKshetra
```

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar @supabase/supabase-js \
  @react-native-async-storage/async-storage react-native-url-polyfill \
  expo-image-picker
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install --save-dev jest @testing-library/react-native \
  @testing-library/jest-native jest-expo
```

- [ ] **Step 4: Configure Jest in `package.json`**

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

- [ ] **Step 5: Write failing geo tests**

```typescript
// __tests__/lib/geo.test.ts
import { haversineKm, boundingBox } from '../../lib/geo';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(12.9716, 77.5946, 12.9716, 77.5946)).toBe(0);
  });

  it('calculates distance between Bangalore and Chennai (~290km)', () => {
    const km = haversineKm(12.9716, 77.5946, 13.0827, 80.2707);
    expect(km).toBeGreaterThan(280);
    expect(km).toBeLessThan(300);
  });
});

describe('boundingBox', () => {
  it('returns a box of ~2km radius around a point', () => {
    const box = boundingBox(12.9716, 77.5946, 1);
    expect(box.minLat).toBeLessThan(12.9716);
    expect(box.maxLat).toBeGreaterThan(12.9716);
    expect(box.minLng).toBeLessThan(77.5946);
    expect(box.maxLng).toBeGreaterThan(77.5946);
  });
});
```

- [ ] **Step 6: Run tests — expect FAIL**

```bash
npx jest __tests__/lib/geo.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '../../lib/geo'"

- [ ] **Step 7: Implement `lib/geo.ts`**

```typescript
// lib/geo.ts
const R = 6371; // Earth radius in km

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / R * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180);
  return {
    minLat: lat - latDelta, maxLat: lat + latDelta,
    minLng: lng - lngDelta, maxLng: lng + lngDelta,
  };
}
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
npx jest __tests__/lib/geo.test.ts --no-coverage
```
Expected: PASS (2 suites, 3 tests)

- [ ] **Step 9: Create design tokens**

```typescript
// constants/colors.ts
export const colors = {
  deepEbony: '#1C0F08',
  templeBrown: '#3D2010',
  sandalwood: '#F5E6C8',
  sacredGold: '#E8C06A',
  saffron: '#C0541A',
  terracotta: '#7A4A2A',
  verifiedGreen: '#2E7D32',
  // Status
  reviewBg: '#FFF3CD', reviewText: '#856404', reviewBorder: '#E8C06A',
  approvedBg: '#E8F5E9', approvedText: '#2E7D32', approvedBorder: '#81C784',
  rejectedBg: '#FFEBEE', rejectedText: '#C62828', rejectedBorder: '#EF9A9A',
} as const;
```

```typescript
// constants/categories.ts
export const CATEGORIES = {
  temple:  { label: 'Temple',       emoji: '🛕', color: '#C0541A', textColor: '#fff'     },
  samadhi: { label: 'Samadhi',      emoji: '🧘', color: '#E8C06A', textColor: '#3D2010'  },
  ashram:  { label: 'Ashram',       emoji: '🌿', color: '#7A4A2A', textColor: '#F5E6C8'  },
  water:   { label: 'Sacred Water', emoji: '💧', color: '#3D4A6A', textColor: '#F5E6C8'  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
```

- [ ] **Step 10: Configure Expo Router root layout**

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Expo project with design tokens and geo utilities"
```

---

## Task 2: Supabase Backend + Data Schema

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/storage.ts`
- Create: `__tests__/lib/storage.test.ts`

> **Before starting:** Create a free Supabase project at supabase.com. Copy the project URL and anon key.

- [ ] **Step 1: Add env vars**

Create `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env.local` to `.gitignore`.

- [ ] **Step 2: Run SQL migration in Supabase SQL editor**

```sql
-- Places table
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('temple','samadhi','ashram','water')),
  deity text,
  description text,
  location geography(point, 4326) not null,
  district text,
  state text,
  timings text,
  entry_info text,
  best_time text,
  status text not null default 'approved' check (status in ('approved','pending','rejected')),
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- Enable PostGIS distance queries
create index places_location_idx on places using gist(location);

-- Submissions table (community-submitted places awaiting review)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  device_token text not null,
  name text not null,
  category text not null,
  deity text,
  description text,
  lat double precision not null,
  lng double precision not null,
  district text,
  state text,
  timings text,
  entry_info text,
  best_time text,
  photo_urls text[],
  status text not null default 'under_review' check (status in ('under_review','approved','rejected')),
  rejection_reason text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Suggested edits table
create table suggested_edits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id),
  device_token text not null,
  changes jsonb not null,
  status text not null default 'under_review',
  created_at timestamptz default now()
);

-- Row-level security: public read for approved places
alter table places enable row level security;
create policy "Public read approved" on places for select using (status = 'approved');

-- Submissions: insert only (no public read of others' submissions)
alter table submissions enable row level security;
create policy "Insert submissions" on submissions for insert with check (true);
create policy "Read own submissions" on submissions for select using (device_token = current_setting('app.device_token', true));
```

- [ ] **Step 3: Create Supabase client**

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { storage: AsyncStorage, autoRefreshToken: false, persistSession: false },
  }
);
```

- [ ] **Step 4: Write failing storage tests**

```typescript
// __tests__/lib/storage.test.ts
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
```

- [ ] **Step 5: Run tests — expect FAIL**

```bash
npx jest __tests__/lib/storage.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '../../lib/storage'"

- [ ] **Step 6: Implement `lib/storage.ts`**

```typescript
// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_TOKEN_KEY = 'device_token';
const SUBMISSIONS_KEY = 'local_submissions';

export async function getDeviceToken(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = uuidv4();
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
```

> **Note:** Install uuid: `npx expo install react-native-get-random-values uuid`

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx jest __tests__/lib/storage.test.ts --no-coverage
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Supabase schema, client, and local submission storage"
```

---

## Task 3: Shared Components — Badges, Status, Bottom Navigation

**Files:**
- Create: `components/shared/StatusBadge.tsx`
- Create: `components/shared/CategoryBadge.tsx`
- Create: `components/add/StepHeader.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `__tests__/components/StatusBadge.test.tsx`
- Create: `__tests__/components/CategoryBadge.test.tsx`
- Create: `__tests__/components/StepHeader.test.tsx`

- [ ] **Step 1: Write failing component tests**

```typescript
// __tests__/components/StatusBadge.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBadge } from '../../components/shared/StatusBadge';

it('renders Under Review badge', () => {
  const { getByText } = render(<StatusBadge status="under_review" />);
  expect(getByText(/Under Review/i)).toBeTruthy();
});

it('renders Approved badge', () => {
  const { getByText } = render(<StatusBadge status="approved" />);
  expect(getByText(/Approved/i)).toBeTruthy();
});

it('renders Not Approved badge', () => {
  const { getByText } = render(<StatusBadge status="rejected" />);
  expect(getByText(/Not Approved/i)).toBeTruthy();
});
```

```typescript
// __tests__/components/StepHeader.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StepHeader } from '../../components/add/StepHeader';

it('renders current step label', () => {
  const { getByText } = render(
    <StepHeader currentStep={2} totalSteps={5} title="Add Sacred Place" label="Basic Info" onBack={jest.fn()} onCancel={jest.fn()} />
  );
  expect(getByText(/Step 2 of 5/i)).toBeTruthy();
  expect(getByText(/Basic Info/i)).toBeTruthy();
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/components/ --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Implement `StatusBadge`**

```typescript
// components/shared/StatusBadge.tsx
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
```

- [ ] **Step 4: Implement `CategoryBadge`**

```typescript
// components/shared/CategoryBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';

export function CategoryBadge({ category }: { category: CategoryKey }) {
  const c = CATEGORIES[category];
  return (
    <View style={[styles.badge, { backgroundColor: c.color }]}>
      <Text style={[styles.text, { color: c.textColor }]}>{c.emoji} {c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: '700' },
});
```

- [ ] **Step 5: Implement `StepHeader`**

```typescript
// components/add/StepHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Props = {
  currentStep: number;
  totalSteps: number;
  title: string;
  label: string;
  onBack: () => void;
  onCancel: () => void;
};

export function StepHeader({ currentStep, totalSteps, title, label, onBack, onCancel }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} accessibilityLabel="Go back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentStep - 1 && styles.dotDone,
              i === currentStep - 1 && styles.dotActive,
              i >= currentStep && styles.dotTodo,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step {currentStep} of {totalSteps} — {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.deepEbony, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { color: colors.sacredGold, fontSize: 18 },
  title: { color: colors.sandalwood, fontFamily: 'serif', fontSize: 13, fontWeight: 'bold' },
  cancel: { color: colors.terracotta, fontSize: 10 },
  dots: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  dotDone: { backgroundColor: colors.sacredGold },
  dotActive: { flex: 2, backgroundColor: colors.saffron },
  dotTodo: { backgroundColor: 'rgba(255,255,255,0.15)' },
  stepLabel: { color: colors.terracotta, fontSize: 9, letterSpacing: 0.5 },
});
```

- [ ] **Step 6: Create tab navigator**

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.deepEbony, borderTopColor: colors.templeBrown },
        tabBarActiveTintColor: colors.sacredGold,
        tabBarInactiveTintColor: colors.terracotta,
      }}
    >
      <Tabs.Screen name="index"  options={{ title: 'Explore',  tabBarIcon: () => null }} />
      <Tabs.Screen name="search" options={{ title: 'Search',   tabBarIcon: () => null }} />
      <Tabs.Screen name="add"    options={{ title: 'Add',      tabBarIcon: () => null }} />
      <Tabs.Screen name="status" options={{ title: 'My Submissions', tabBarIcon: () => null }} />
    </Tabs>
  );
}
```

- [ ] **Step 7: Add placeholder tab screens so the app runs**

```typescript
// app/(tabs)/index.tsx
import { View, Text } from 'react-native';
import { colors } from '../../constants/colors';
export default function ExploreTab() {
  return <View style={{ flex:1, backgroundColor: colors.sandalwood, alignItems:'center', justifyContent:'center' }}><Text>Map — coming soon</Text></View>;
}
```
Repeat for `search.tsx`, `add.tsx`, `status.tsx` with matching placeholder text.

- [ ] **Step 8: Run tests — expect PASS**

```bash
npx jest __tests__/components/ --no-coverage
```
Expected: PASS

- [ ] **Step 9: Run app**

```bash
npx expo start
```
Expected: App loads, 4 tabs visible, placeholder screens navigable.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: shared badges, step header, bottom tab navigation"
```

---

## Task 4: Home Screen — Map View

**Dependencies:** MapLibre requires native build. Run `npx expo prebuild` before this task.

**Files:**
- Create: `components/map/SpiritualMap.tsx`
- Create: `components/map/SpiritualMarker.tsx`
- Create: `components/map/PlaceBottomSheet.tsx`
- Create: `hooks/usePlaces.ts`
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Install MapLibre and bottom sheet**

```bash
npx expo install @maplibre/maplibre-react-native react-native-bottom-sheet \
  react-native-reanimated react-native-gesture-handler
```

Add to `app/_layout.tsx`:
```typescript
import 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
```

Add to `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```

Run: `npx expo prebuild --clean`

- [ ] **Step 2: Implement `usePlaces` hook**

```typescript
// hooks/usePlaces.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { boundingBox } from '../lib/geo';

export type Place = {
  id: string;
  name: string;
  category: 'temple' | 'samadhi' | 'ashram' | 'water';
  deity?: string;
  lat: number;
  lng: number;
  district?: string;
  state?: string;
  status: 'approved' | 'pending';
  verified_at?: string;
};

export function usePlaces(lat: number | null, lng: number | null, radiusKm = 50) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;
    const box = boundingBox(lat, lng, radiusKm);
    setLoading(true);
    supabase
      .from('places')
      .select('id, name, category, deity, district, state, status, verified_at, location')
      .filter('location', 'gte', `POINT(${box.minLng} ${box.minLat})`)
      .filter('location', 'lte', `POINT(${box.maxLng} ${box.maxLat})`)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setPlaces(
          (data ?? []).map((p: any) => ({
            ...p,
            lat: p.location.coordinates[1],
            lng: p.location.coordinates[0],
          }))
        );
        setLoading(false);
      });
  }, [lat, lng, radiusKm]);

  return { places, loading, error };
}
```

- [ ] **Step 3: Implement `SpiritualMarker`**

```typescript
// components/map/SpiritualMarker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';

type Props = { category: CategoryKey; selected?: boolean; dimmed?: boolean };

export function SpiritualMarker({ category, selected = false, dimmed = false }: Props) {
  const c = CATEGORIES[category];
  return (
    <View style={[styles.wrapper, dimmed && styles.dimmed]}>
      <View style={[
        styles.circle,
        { backgroundColor: c.color },
        selected && styles.selected,
      ]}>
        <Text style={styles.emoji}>{c.emoji}</Text>
      </View>
      <View style={[styles.stem, { backgroundColor: c.color }]} />
      <View style={styles.shadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  dimmed: { opacity: 0.4 },
  circle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2.5, borderColor: '#E8C06A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  selected: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#E8C06A', shadowOpacity: 0.5, shadowRadius: 8,
  },
  emoji: { fontSize: 16 },
  stem: { width: 2, height: 8 },
  shadow: { width: 8, height: 3, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
});
```

- [ ] **Step 4: Implement `SpiritualMap`**

```typescript
// components/map/SpiritualMap.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Place } from '../../hooks/usePlaces';
import { SpiritualMarker } from './SpiritualMarker';
import { CategoryKey } from '../../constants/categories';

MapLibreGL.setAccessToken(null); // OSM — no token needed

const OSM_STYLE: MapLibreGL.StyleURL = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
} as any;

type Props = {
  places: Place[];
  selectedId: string | null;
  onMarkerPress: (place: Place) => void;
  userLat?: number;
  userLng?: number;
};

export function SpiritualMap({ places, selectedId, onMarkerPress, userLat = 20.5937, userLng = 78.9629 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView style={StyleSheet.absoluteFill} styleJSON={JSON.stringify(OSM_STYLE)}>
        <MapLibreGL.Camera centerCoordinate={[userLng, userLat]} zoomLevel={10} />
        {places.map((place) => (
          <MapLibreGL.MarkerView key={place.id} coordinate={[place.lng, place.lat]}>
            <SpiritualMarker
              category={place.category as CategoryKey}
              selected={place.id === selectedId}
              dimmed={selectedId !== null && place.id !== selectedId}
            />
          </MapLibreGL.MarkerView>
        ))}
      </MapLibreGL.MapView>
    </View>
  );
}
```

- [ ] **Step 5: Implement `PlaceBottomSheet`**

```typescript
// components/map/PlaceBottomSheet.tsx
import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Place } from '../../hooks/usePlaces';
import { CategoryBadge } from '../shared/CategoryBadge';
import { colors } from '../../constants/colors';
import { CategoryKey } from '../../constants/categories';

type Props = { place: Place | null; distanceKm: number | null; onViewDetails: () => void };

export function PlaceBottomSheet({ place, distanceKm, onViewDetails }: Props) {
  const snapPoints = ['30%'];
  if (!place) return null;
  const isVerified = !!place.verified_at;

  return (
    <BottomSheet snapPoints={snapPoints} enablePanDownToClose>
      <BottomSheetView style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 40 }}>{/* hero photo via place.photo_url */}🛕</Text>
          </View>
          {isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Recently Verified</Text></View>}
        </View>
        <Text style={styles.name}>{place.name}</Text>
        {place.deity && <Text style={styles.deity}>Deity: {place.deity}</Text>}
        <View style={styles.metaRow}>
          {distanceKm !== null && <Text style={styles.dist}>📍 {distanceKm.toFixed(1)} km away</Text>}
          <CategoryBadge category={place.category as CategoryKey} />
        </View>
        <TouchableOpacity style={styles.cta} onPress={onViewDetails}>
          <Text style={styles.ctaText}>View Details →</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, backgroundColor: colors.sandalwood },
  imageContainer: { width: '100%', height: 90, borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative' },
  imagePlaceholder: { flex: 1, backgroundColor: '#C0541A', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(46,125,50,0.9)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  name: { fontFamily: 'serif', fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  deity: { fontSize: 11, color: colors.terracotta, fontStyle: 'italic', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dist: { fontSize: 11, color: colors.saffron, fontWeight: '600' },
  cta: { backgroundColor: colors.saffron, borderRadius: 10, height: 38, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
```

- [ ] **Step 6: Wire up `app/(tabs)/index.tsx`**

```typescript
// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SpiritualMap } from '../../components/map/SpiritualMap';
import { PlaceBottomSheet } from '../../components/map/PlaceBottomSheet';
import { usePlaces, Place } from '../../hooks/usePlaces';
import { haversineKm } from '../../lib/geo';
import { colors } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';

export default function ExploreTab() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { places, loading } = usePlaces(userLocation?.lat ?? null, userLocation?.lng ?? null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync().then(({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      });
    });
  }, []);

  const filtered = activeCategory === 'all' ? places : places.filter((p) => p.category === activeCategory);

  const distanceToSelected = selectedPlace && userLocation
    ? haversineKm(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng)
    : null;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search temples, deities, places…"
          placeholderTextColor={colors.terracotta}
          onFocus={() => router.push('/search')}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
        {['all', ...Object.keys(CATEGORIES)].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, activeCategory === key && styles.chipActive]}
            onPress={() => setActiveCategory(key)}
          >
            <Text style={[styles.chipText, activeCategory === key && styles.chipTextActive]}>
              {key === 'all' ? '⭐ All' : `${CATEGORIES[key as keyof typeof CATEGORIES].emoji} ${CATEGORIES[key as keyof typeof CATEGORIES].label}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <SpiritualMap
        places={filtered}
        selectedId={selectedPlace?.id ?? null}
        onMarkerPress={setSelectedPlace}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />

      {/* Bottom sheet */}
      {selectedPlace && (
        <PlaceBottomSheet
          place={selectedPlace}
          distanceKm={distanceToSelected}
          onViewDetails={() => router.push(`/place/${selectedPlace.id}`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { position: 'absolute', top: 48, left: 12, right: 12, zIndex: 10, height: 42, backgroundColor: 'rgba(245,230,200,0.97)', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: colors.deepEbony },
  chips: { position: 'absolute', top: 98, left: 0, right: 0, zIndex: 10 },
  chip: { height: 28, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(245,230,200,0.92)', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.saffron },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.deepEbony },
  chipTextActive: { color: '#fff' },
});
```

> Install expo-location: `npx expo install expo-location`
> Add `expo-location` to `app.json` plugins and request permissions.

- [ ] **Step 7: Run on simulator**

```bash
npx expo run:ios   # or npx expo run:android
```
Expected: Map loads with OSM tiles, filter chips visible, search bar floats above.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: home screen with MapLibre OSM map, spiritual markers, filter chips, bottom sheet"
```

---

## Task 5: Place Details Screen

**Files:**
- Create: `hooks/usePlace.ts`
- Create: `components/place/InfoGrid.tsx`
- Create: `components/place/PhotoStrip.tsx`
- Create: `components/place/HeroImage.tsx`
- Create: `components/place/MapSnippet.tsx`
- Create: `app/place/[id].tsx`

- [ ] **Step 1: Implement `usePlace` hook**

```typescript
// hooks/usePlace.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type PlaceDetail = {
  id: string; name: string; category: string; deity?: string;
  description?: string; lat: number; lng: number;
  district?: string; state?: string; timings?: string;
  entry_info?: string; best_time?: string;
  status: string; verified_at?: string;
  photo_urls?: string[];
};

export function usePlace(id: string) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('places').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setPlace({ ...data, lat: data.location?.coordinates?.[1], lng: data.location?.coordinates?.[0] });
        setLoading(false);
      });
  }, [id]);

  return { place, loading };
}
```

- [ ] **Step 2: Implement supporting components**

```typescript
// components/place/InfoGrid.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type InfoItem = { label: string; value: string };

export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(232,192,106,0.15)', borderWidth: 1, borderColor: 'rgba(232,192,106,0.35)', borderRadius: 8, padding: 8 },
  label: { fontSize: 9, color: colors.terracotta, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  value: { fontSize: 11, color: colors.deepEbony, fontWeight: '600' },
});
```

```typescript
// components/place/MapSnippet.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { colors } from '../../constants/colors';

export function MapSnippet({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const openMaps = () => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  return (
    <TouchableOpacity style={styles.container} onPress={openMaps}>
      <View style={styles.mapBg}><Text style={{ fontSize: 24 }}>📍</Text></View>
      <View style={styles.navBtn}><Text style={styles.navText}>▶ Navigate</Text></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 80, borderRadius: 10, overflow: 'hidden', marginBottom: 14, position: 'relative', backgroundColor: '#C8A87A' },
  mapBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navBtn: { position: 'absolute', bottom: 6, right: 8, backgroundColor: colors.saffron, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  navText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
```

- [ ] **Step 2b: Implement `HeroImage`**

```typescript
// components/place/HeroImage.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  photoUrls?: string[];
  isVerified: boolean;
  onBack: () => void;
  currentIndex: number;
  onDotPress: (i: number) => void;
};

export function HeroImage({ photoUrls = [], isVerified, onBack, currentIndex, onDotPress }: Props) {
  const hasPhoto = photoUrls.length > 0;
  return (
    <View style={styles.hero}>
      {hasPhoto ? (
        <Image source={{ uri: photoUrls[currentIndex] }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill as any, styles.placeholder]}>
          <Text style={{ fontSize: 60 }}>🛕</Text>
        </View>
      )}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityLabel="Go back">
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      {isVerified && (
        <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Recently Verified</Text></View>
      )}
      {photoUrls.length > 1 && (
        <View style={styles.dots}>
          {photoUrls.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => onDotPress(i)}>
              <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 210, backgroundColor: '#C0541A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 44, left: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 16 },
  verifiedBadge: { position: 'absolute', top: 44, right: 12, backgroundColor: 'rgba(46,125,50,0.9)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 10, flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 16, borderRadius: 3, backgroundColor: '#fff' },
});
```

- [ ] **Step 2c: Implement `PhotoStrip`**

```typescript
// components/place/PhotoStrip.tsx
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
        <TouchableOpacity style={styles.addThumb} onPress={onAddPhoto}>
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
  addThumb: { width: 70, height: 60, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.terracotta, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(122,74,42,0.05)', gap: 2 },
  addText: { color: colors.terracotta, fontSize: 16 },
  addLabel: { color: colors.terracotta, fontSize: 8 },
});
```

- [ ] **Step 3: Implement Place Details screen**

```typescript
// app/place/[id].tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlace } from '../../hooks/usePlace';
import { HeroImage } from '../../components/place/HeroImage';
import { InfoGrid } from '../../components/place/InfoGrid';
import { PhotoStrip } from '../../components/place/PhotoStrip';
import { MapSnippet } from '../../components/place/MapSnippet';
import { CategoryBadge } from '../../components/shared/CategoryBadge';
import { colors } from '../../constants/colors';
import { CategoryKey } from '../../constants/categories';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { place, loading } = usePlace(id);

  if (loading) return <View style={{ flex:1, backgroundColor: colors.sandalwood }} />;
  if (!place) return null;

  const isVerified = !!place.verified_at;
  const isPending = place.status === 'pending';
  const [heroIndex, setHeroIndex] = useState(0);

  const infoItems = [
    place.timings    && { label: 'Darshan Hours',  value: place.timings },
    place.entry_info && { label: 'Entry',          value: place.entry_info },
    place.district   && { label: 'Location',       value: `${place.district}, ${place.state}` },
    place.best_time  && { label: 'Best Time',      value: place.best_time },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero — uses HeroImage component with real photos and carousel dots */}
        <HeroImage
          photoUrls={place.photo_urls ?? []}
          isVerified={isVerified}
          onBack={() => router.back()}
          currentIndex={heroIndex}
          onDotPress={setHeroIndex}
        />

        <View style={styles.body}>
          {isPending && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>⏳ Under Community Review — details may change</Text>
            </View>
          )}

          <Text style={styles.name}>{place.name}</Text>
          {place.deity && <Text style={styles.deity}>Deity: {place.deity}</Text>}
          <View style={styles.metaRow}>
            <CategoryBadge category={place.category as CategoryKey} />
            <Text style={styles.location}>📍 {place.district}, {place.state}</Text>
          </View>

          <MapSnippet lat={place.lat} lng={place.lng} name={place.name} />

          {place.description && <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{place.description}</Text>
          </>}

          {infoItems.length > 0 && <>
            <Text style={styles.sectionTitle}>Timings & Details</Text>
            <InfoGrid items={infoItems} />
          </>}

          {/* Photo strip — "+ Add" slot disabled while pending (spec §4.2) */}
          {(place.photo_urls?.length || !isPending) && <>
            <Text style={styles.sectionTitle}>Photos</Text>
            <PhotoStrip
              photoUrls={place.photo_urls ?? []}
              onAddPhoto={isPending ? undefined : () => { /* navigate to photo upload */ }}
            />
          </>}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionSuggest, isPending && styles.actionDisabled]}
              disabled={isPending}
              onPress={() => router.push({ pathname: '/add/step2-info', params: { editPlaceId: place.id } })}
            >
              <Text style={styles.actionSuggestText}>{isPending ? '✏️ Edits Paused During Review' : '✏️ Suggest Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionReport]}>
              <Text style={styles.actionReportText}>⚑ Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ message: `${place.name} — DivyaKshetra` })}>
          <Text style={{ fontSize: 16 }}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.directionsBtn}
          onPress={() => require('expo-linking').openURL(`https://maps.google.com/?q=${place.lat},${place.lng}`)}>
          <Text style={styles.directionText}>▶ Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 210, backgroundColor: '#C0541A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 44, left: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 16 },
  verifiedBadge: { position: 'absolute', top: 44, right: 12, backgroundColor: 'rgba(46,125,50,0.9)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  body: { padding: 14, paddingBottom: 100 },
  pendingBanner: { backgroundColor: 'rgba(255,243,205,0.9)', borderWidth: 1, borderColor: colors.sacredGold, borderRadius: 8, padding: 10, marginBottom: 12 },
  pendingText: { fontSize: 10, color: colors.terracotta, lineHeight: 16 },
  name: { fontSize: 18, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 4 },
  deity: { fontSize: 12, color: colors.terracotta, fontStyle: 'italic', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 14 },
  location: { fontSize: 10, color: colors.saffron, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.terracotta, marginBottom: 6, marginTop: 14 },
  description: { fontSize: 12, color: colors.templeBrown, lineHeight: 20, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionSuggest: { backgroundColor: 'rgba(192,84,26,0.12)', borderWidth: 1, borderColor: 'rgba(192,84,26,0.3)' },
  actionReport: { backgroundColor: 'rgba(122,74,42,0.08)', borderWidth: 1, borderColor: 'rgba(122,74,42,0.2)' },
  actionDisabled: { opacity: 0.5 },
  actionSuggestText: { fontSize: 10, fontWeight: '600', color: colors.saffron },
  actionReportText: { fontSize: 10, fontWeight: '600', color: colors.terracotta },
  content: { paddingBottom: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.sandalwood, borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.2)', padding: 10, paddingBottom: 28, flexDirection: 'row', gap: 8 },
  shareBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(232,192,106,0.2)', borderWidth: 1, borderColor: 'rgba(232,192,106,0.4)', alignItems: 'center', justifyContent: 'center' },
  directionsBtn: { flex: 1, height: 42, borderRadius: 10, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' },
  directionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
```

- [ ] **Step 4: Run on simulator, navigate from bottom sheet to Place Details**

Expected: Push to `/place/[id]`, hero renders, back button works, "Get Directions" opens native maps.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: place details screen with hero, info grid, map snippet, suggest edit"
```

---

## Task 6: Add New Place — Steps 1–3

**Files:**
- Create: `lib/addFormStore.ts` (in-memory context to pass form state across steps)
- Create: `app/add/_layout.tsx` (wraps all step screens with AddFormProvider)
- Create: `components/add/LocationPicker.tsx`
- Create: `components/add/CategoryGrid.tsx`
- Create: `components/add/PhotoUploader.tsx`
- Create: `app/add/step1-location.tsx`
- Create: `app/add/step2-info.tsx`
- Create: `app/add/step3-photos.tsx`

- [ ] **Step 1: Create add-form context (no AsyncStorage — ephemeral)**

```typescript
// lib/addFormStore.ts
import React, { createContext, useContext, useState } from 'react';

export type AddFormState = {
  lat?: number; lng?: number;
  name?: string; category?: string; deity?: string; district?: string; state?: string;
  photoUris?: string[];
  description?: string; timings?: string; entryInfo?: string; bestTime?: string;
  editPlaceId?: string; // set when in edit/suggest mode
};

const AddFormContext = createContext<{
  form: AddFormState;
  setForm: (patch: Partial<AddFormState>) => void;
  reset: () => void;
}>({ form: {}, setForm: () => {}, reset: () => {} });

export function AddFormProvider({ children }: { children: React.ReactNode }) {
  const [form, setFormState] = useState<AddFormState>({});
  return (
    <AddFormContext.Provider value={{
      form,
      setForm: (patch) => setFormState((prev) => ({ ...prev, ...patch })),
      reset: () => setFormState({}),
    }}>
      {children}
    </AddFormContext.Provider>
  );
}

export const useAddForm = () => useContext(AddFormContext);
```

Create `app/add/_layout.tsx` — this wraps **all** step screens with `AddFormProvider` so form state is shared across steps 1–5:

```typescript
// app/add/_layout.tsx
import { Stack } from 'expo-router';
import { AddFormProvider } from '../../lib/addFormStore';

export default function AddLayout() {
  return (
    <AddFormProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AddFormProvider>
  );
}
```

> Note: `app/(tabs)/add.tsx` is just an entry point that navigates to `/add/step1-location`. It does NOT need its own `AddFormProvider` — the context lives in `app/add/_layout.tsx` and covers all step screens automatically via Expo Router's nested layout.

- [ ] **Step 2: Implement `LocationPicker`**

```typescript
// components/add/LocationPicker.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { colors } from '../../constants/colors';

// OSM style (same constant used in SpiritualMap — extract to lib/mapStyle.ts to DRY)
const OSM_STYLE = JSON.stringify({
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
});

type Props = { lat: number; lng: number; onChange: (lat: number, lng: number) => void; nearbyCount?: number };

export function LocationPicker({ lat, lng, onChange, nearbyCount = 0 }: Props) {
  // MapLibre does not support draggable MarkerView natively.
  // Strategy: use a PointAnnotation (supports onDragEnd) or
  // overlay a PanResponder on the map and convert screen coords to geo coords.
  // Best supported option: ShapeSource + SymbolLayer with draggable PointAnnotation.
  const [pinCoord, setPinCoord] = useState<[number, number]>([lng, lat]);

  const handleDragEnd = (e: any) => {
    // PointAnnotation onDragEnd provides geometry.coordinates: [lng, lat]
    const [newLng, newLat] = e.geometry.coordinates;
    setPinCoord([newLng, newLat]);
    onChange(newLat, newLng);
  };

  return (
    <View>
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView style={StyleSheet.absoluteFill} styleJSON={OSM_STYLE}>
          <MapLibreGL.Camera centerCoordinate={pinCoord} zoomLevel={14} />
          {/* PointAnnotation supports onDragEnd — use instead of MarkerView for draggable pin */}
          <MapLibreGL.PointAnnotation
            id="new-place-pin"
            coordinate={pinCoord}
            draggable
            onDragEnd={handleDragEnd}
          >
            <View style={styles.pin}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text></View>
          </MapLibreGL.PointAnnotation>
        </MapLibreGL.MapView>
        <Text style={styles.dragHint}>✥ Drag pin to adjust</Text>
      </View>
      {nearbyCount > 0 && (
        <View style={styles.nearbyBanner}>
          <Text style={styles.nearbyText}>⚠️ {nearbyCount} places already nearby. Please check they're not the same before adding.</Text>
        </View>
      )}
      <Text style={styles.helperText}>📍 Accurate location improves approval chances</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  pin: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.saffron, borderWidth: 3, borderColor: colors.sacredGold, alignItems: 'center', justifyContent: 'center' },
  dragHint: { position: 'absolute', bottom: 8, alignSelf: 'center', backgroundColor: 'rgba(28,15,8,0.75)', color: colors.sandalwood, fontSize: 9, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  nearbyBanner: { backgroundColor: 'rgba(255,243,205,0.92)', borderWidth: 1, borderColor: colors.sacredGold, borderRadius: 8, padding: 8, marginBottom: 10 },
  nearbyText: { fontSize: 10, color: colors.terracotta, lineHeight: 16 },
  helperText: { fontSize: 10, color: colors.saffron, marginBottom: 12 },
});
```

- [ ] **Step 3: Implement `CategoryGrid`**

```typescript
// components/add/CategoryGrid.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORIES, CategoryKey } from '../../constants/categories';
import { colors } from '../../constants/colors';

type Props = { selected?: CategoryKey; onSelect: (key: CategoryKey) => void };

export function CategoryGrid({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(([key, cat]) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selected === key && { borderColor: colors.saffron, backgroundColor: 'rgba(192,84,26,0.08)' }]}
          onPress={() => onSelect(key)}
        >
          <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
          <Text style={[styles.label, selected === key && { color: colors.saffron }]}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  option: { flex: 1, minWidth: '45%', height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(122,74,42,0.2)', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 9, color: colors.terracotta, fontWeight: '600' },
});
```

- [ ] **Step 4: Implement `PhotoUploader`**

```typescript
// components/add/PhotoUploader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';

type Props = { uris: string[]; onChange: (uris: string[]) => void };

export function PhotoUploader({ uris, onChange }: Props) {
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      onChange([...uris, result.assets[0].uri]);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.primary} onPress={pickImage}>
        <Text style={styles.primaryIcon}>📸</Text>
        <Text style={styles.primaryLabel}>Take a Photo</Text>
        <Text style={styles.primarySub}>Clear temple photos help faster approval</Text>
      </TouchableOpacity>
      <View style={styles.qualityHint}>
        <Text style={styles.qualityText}>✓ Photos with clear view of the main entrance or shrine significantly improve approval chances.</Text>
      </View>
      <View style={styles.thumbRow}>
        {uris.map((uri, i) => (
          <View key={i} style={styles.thumbAdded}>
            <Image source={{ uri }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
            <View style={styles.thumbCheck}><Text style={{ fontSize: 8, color: '#fff' }}>✓</Text></View>
          </View>
        ))}
        {uris.length < 4 && <TouchableOpacity style={styles.thumbAdd} onPress={pickImage}><Text style={{ color: colors.terracotta, fontSize: 18 }}>+</Text></TouchableOpacity>}
      </View>
      <Text style={styles.skip}>Skip for now — you can add photos later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  primary: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.saffron, borderRadius: 12, height: 130, alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8, backgroundColor: 'rgba(192,84,26,0.06)' },
  primaryIcon: { fontSize: 32 },
  primaryLabel: { fontSize: 12, fontWeight: '700', color: colors.saffron },
  primarySub: { fontSize: 9, color: colors.terracotta, textAlign: 'center', paddingHorizontal: 20 },
  qualityHint: { backgroundColor: 'rgba(46,125,50,0.08)', borderWidth: 1, borderColor: 'rgba(46,125,50,0.25)', borderRadius: 8, padding: 8, marginBottom: 10 },
  qualityText: { fontSize: 10, color: '#2E7D32', lineHeight: 16 },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  thumbAdded: { width: 64, height: 54, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  thumbCheck: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, backgroundColor: '#2E7D32', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  thumbAdd: { width: 64, height: 54, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(122,74,42,0.35)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(122,74,42,0.05)' },
  skip: { fontSize: 10, color: colors.terracotta, textAlign: 'center', marginTop: 4 },
});
```

- [ ] **Step 5: Wire up Steps 1–3 screens**

```typescript
// app/add/step1-location.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { LocationPicker } from '../../components/add/LocationPicker';
import { useAddForm } from '../../lib/addFormStore';
import { colors } from '../../constants/colors';

export default function Step1() {
  const router = useRouter();
  const { form, setForm } = useAddForm();
  const lat = form.lat ?? 20.5937;
  const lng = form.lng ?? 78.9629;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader currentStep={1} totalSteps={5} title={form.editPlaceId ? 'Suggest an Edit' : 'Add Sacred Place'} label="Location" onBack={() => router.back()} onCancel={() => { router.dismissAll(); }} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Where is this place?</Text>
        <Text style={styles.sub}>Drag the pin to the exact location.</Text>
        <LocationPicker lat={lat} lng={lng} onChange={(la, lo) => setForm({ lat: la, lng: lo })} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/add/step2-info')}>
          <Text style={styles.ctaText}>Confirm Location →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  sub: { fontSize: 10, color: colors.terracotta, marginBottom: 14, lineHeight: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.sandalwood, borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)', padding: 10, paddingBottom: 28 },
  cta: { backgroundColor: colors.saffron, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
```

> Implement `step2-info.tsx` and `step3-photos.tsx` with the same pattern: `StepHeader`, scroll content, `setForm(...)`, footer CTA navigating to next step.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add new place steps 1–3 (location, basic info, photos)"
```

---

## Task 7: Add New Place — Steps 4–5 + Submission

**Files:**
- Create: `app/add/step4-details.tsx`
- Create: `app/add/step5-review.tsx`
- Modify: `lib/storage.ts` (already done)

- [ ] **Step 1: Implement `step4-details.tsx`**

Fields: description (textarea), timings, entry_info, best_time (optional text inputs). All optional. Micro-copy: "More details = faster verification ✓". CTA: "Review Submission →".

- [ ] **Step 2: Implement `step5-review.tsx` with submission logic**

```typescript
// app/add/step5-review.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StepHeader } from '../../components/add/StepHeader';
import { useAddForm } from '../../lib/addFormStore';
import { supabase } from '../../lib/supabase';
import { getDeviceToken, saveSubmissionLocally } from '../../lib/storage';
import { colors } from '../../constants/colors';

export default function Step5() {
  const router = useRouter();
  const { form, reset } = useAddForm();
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!form.editPlaceId;

  const submit = async () => {
    setSubmitting(true);
    const deviceToken = await getDeviceToken();

    if (isEditMode) {
      // Suggest edit — separate table
      await supabase.from('suggested_edits').insert({
        place_id: form.editPlaceId,
        device_token: deviceToken,
        changes: { name: form.name, deity: form.deity, description: form.description, timings: form.timings, entry_info: form.entryInfo },
      });
    } else {
      const { data, error } = await supabase.from('submissions').insert({
        device_token: deviceToken,
        name: form.name,
        category: form.category,
        deity: form.deity,
        description: form.description,
        lat: form.lat,
        lng: form.lng,
        district: form.district,
        state: form.state,
        timings: form.timings,
        entry_info: form.entryInfo,
        best_time: form.bestTime,
        photo_urls: form.photoUris ?? [],
      }).select('id').single();

      if (!error && data) {
        await saveSubmissionLocally({
          id: data.id, name: form.name!, category: form.category,
          status: 'under_review', createdAt: Date.now(),
        });
      }
    }

    reset();
    setSubmitting(false);
    router.replace('/(tabs)/status');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood }}>
      <StepHeader currentStep={5} totalSteps={5} title={isEditMode ? 'Suggest an Edit' : 'Add Sacred Place'} label="Review" onBack={() => router.back()} onCancel={() => router.dismissAll()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Review your submission</Text>
        <Text style={styles.sub}>Our team will verify before it appears on the map.</Text>

        <View style={styles.reviewCard}>
          {[
            { key: 'Name',     val: form.name },
            { key: 'Category', val: form.category },
            { key: 'Deity',    val: form.deity },
            { key: 'Location', val: form.district ? `${form.district}, ${form.state}` : undefined },
            { key: 'Photos',   val: form.photoUris?.length ? `${form.photoUris.length} photo(s)` : 'None' },
          ].filter((r) => r.val).map((row) => (
            <View key={row.key} style={styles.reviewRow}>
              <Text style={styles.reviewKey}>{row.key}</Text>
              <Text style={styles.reviewVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>Your submission is anonymous. We may add clarifications if needed.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>{isEditMode ? 'Submit Suggestion 🙏' : 'Submit for Review 🙏'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 100 },
  heading: { fontSize: 15, fontWeight: 'bold', color: colors.deepEbony, marginBottom: 3 },
  sub: { fontSize: 10, color: colors.terracotta, marginBottom: 14, lineHeight: 16 },
  reviewCard: { backgroundColor: 'rgba(232,192,106,0.12)', borderWidth: 1, borderColor: 'rgba(232,192,106,0.3)', borderRadius: 10, padding: 10, marginBottom: 10 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(122,74,42,0.1)' },
  reviewKey: { fontSize: 10, color: colors.terracotta, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewVal: { fontSize: 11, color: colors.deepEbony, fontWeight: '600', textAlign: 'right', maxWidth: '55%' },
  disclaimer: { fontSize: 10, color: colors.terracotta, textAlign: 'center', lineHeight: 16, paddingHorizontal: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.sandalwood, borderTopWidth: 1, borderTopColor: 'rgba(122,74,42,0.15)', padding: 10, paddingBottom: 28 },
  cta: { borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
```

- [ ] **Step 3: Test full add flow end to end**

1. Open the Add tab → auto-navigates to step 1
2. Set location, confirm
3. Fill name, pick category, tap next
4. Take/skip photo, tap next
5. Fill optional details, tap next
6. Review summary, tap "Submit for Review 🙏"
7. Redirects to Submission Status tab

Expected: Submission appears in Supabase `submissions` table. Local submission saved to AsyncStorage with status `under_review`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add new place steps 4–5, submission to Supabase, local status tracking"
```

---

## Task 8: Submission Status Screen

**Files:**
- Create: `hooks/useSubmissions.ts`
- Modify: `app/(tabs)/status.tsx`

- [ ] **Step 1: Implement `useSubmissions` hook**

```typescript
// hooks/useSubmissions.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceToken, getLocalSubmissions, updateLocalSubmissionStatus, LocalSubmission } from '../lib/storage';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getDeviceToken();
    const local = await getLocalSubmissions();

    // Sync status from Supabase
    if (local.length > 0) {
      const { data } = await supabase.from('submissions')
        .select('id, status, rejection_reason')
        .eq('device_token', token);

      for (const row of data ?? []) {
        const local_entry = local.find((s) => s.id === row.id);
        if (local_entry && local_entry.status !== row.status) {
          await updateLocalSubmissionStatus(row.id, row.status, row.rejection_reason);
        }
      }
    }

    setSubmissions(await getLocalSubmissions());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { submissions, loading, refresh };
}
```

- [ ] **Step 2: Implement Submission Status screen**

Full screen: dark nav header, access hint banner (with submission code), collapsible submission cards for each status state, empty state. Use `useSubmissions` hook. See spec Section 4.4 for exact copy and interaction details.

Key details:
- Approved card expanded: green explanation message
- Rejected card expanded: reason block + "↺ Resubmit with More Details" CTA (navigates to `/add/step1-location` with form pre-filled)
- Submission code displayed in a "Recovery" section using `getSubmissionCode(token)`

- [ ] **Step 3: Test all three card states**

Manually set a submission's status to `approved`, `rejected`, `under_review` in Supabase → reopen app → verify correct badge and expanded content.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: submission status screen with live sync, rejection reasons, resubmit CTA"
```

---

## Task 9: Search & Discovery Screen

**Files:**
- Create: `hooks/useSearch.ts`
- Create: `components/search/SearchHeader.tsx`
- Create: `components/search/ResultRow.tsx`
- Create: `components/search/RecentPills.tsx`
- Modify: `app/(tabs)/search.tsx`

- [ ] **Step 1: Write failing search hook test**

```typescript
// __tests__/hooks/useSearch.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useSearch } from '../../hooks/useSearch';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ ilike: () => ({ limit: () => Promise.resolve({ data: [{ id: '1', name: 'Palani Murugan Temple', category: 'temple', district: 'Palani', state: 'Tamil Nadu', lat: 10.4, lng: 77.5 }], error: null }) }) })
    })
  }
}));

it('returns results matching a query', async () => {
  const { result } = renderHook(() => useSearch());
  act(() => result.current.setQuery('muruga'));
  await act(async () => {});
  expect(result.current.results.length).toBeGreaterThan(0);
  expect(result.current.results[0].name).toContain('Murugan');
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/hooks/useSearch.test.ts --no-coverage
```

- [ ] **Step 3: Implement `useSearch`**

```typescript
// hooks/useSearch.ts
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type SearchResult = {
  id: string; name: string; category: string;
  deity?: string; district?: string; state?: string;
  lat: number; lng: number;
};

const RECENT_KEY = 'recent_searches';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => setRecent(raw ? JSON.parse(raw) : []));
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.from('places').select('id, name, category, deity, district, state, location')
        .ilike('name', `%${query}%`).limit(20);
      setResults((data ?? []).map((p: any) => ({
        ...p, lat: p.location?.coordinates?.[1], lng: p.location?.coordinates?.[0],
      })));
      setLoading(false);
    }, 300);
  }, [query]);

  const saveRecent = async (q: string) => {
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const removeRecent = async (q: string) => {
    const updated = recent.filter((r) => r !== q);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  return { query, setQuery, results, recent, loading, saveRecent, removeRecent };
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/hooks/useSearch.test.ts --no-coverage
```

- [ ] **Step 5: Implement Search screen**

Wire up `useSearch` hook into `app/(tabs)/search.tsx`. Three states:
- Default (no query): show `RecentPills` + nearby places list
- Typing (query < 3 chars): show live suggestions with saffron match highlight
- Results (query submitted): show full result list with filter chips and result count

Each `ResultRow` is tappable → `router.push('/place/[id]')` + `saveRecent(query)`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: search screen with typeahead, recent searches, deity search, result highlight"
```

---

## Task 10: Splash Screen + Final Polish

**Files:**
- Create: `components/shared/SplashScreen.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app.json` (icon, splash, permissions)

- [ ] **Step 1: Implement animated splash**

```typescript
// components/shared/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.lamp}>🪔</Text>
      <Text style={styles.title}>DivyaKshetra</Text>
      <Text style={styles.devanagari}>दिव्यक्षेत्र</Text>
      <Text style={styles.sub}>Sacred Places of India</Text>
      <View style={styles.divider} />
      <Text style={styles.loading}>Finding sacred places near you…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.sandalwood, alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 100 },
  lamp: { fontSize: 52, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.deepEbony },
  devanagari: { fontSize: 16, color: colors.terracotta, letterSpacing: 2 },
  sub: { fontSize: 10, color: colors.terracotta, letterSpacing: 3, textTransform: 'uppercase', marginTop: -4 },
  divider: { width: 60, height: 1, backgroundColor: colors.sacredGold, marginVertical: 8 },
  loading: { fontSize: 10, color: colors.terracotta, letterSpacing: 1 },
});
```

- [ ] **Step 2: Show splash on first load in `app/_layout.tsx`**

Add `useState(true)` for `showSplash`. Render `<SplashScreen onDone={() => setShowSplash(false)} />` over the tab navigator while `showSplash` is true.

- [ ] **Step 3: Run full test suite**

```bash
npx jest --no-coverage
```
Expected: All tests pass.

- [ ] **Step 4: Update `app.json`**

Set:
- `name`: "DivyaKshetra"
- `slug`: "divyakshetra"
- `permissions`: `["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]`
- `ios.infoPlist`: `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`
- `android.permissions`: location + camera

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: splash screen animation, permissions config, full app polish"
```

---

## Running the Full Test Suite

```bash
npx jest --coverage
```

Expected test coverage of hooks and lib utilities > 70%. Component tests cover badge rendering and step header.

---

## Deployment Checklist

- [ ] Supabase RLS policies tested with a real device token
- [ ] OSM tile usage tested on slow 3G (should degrade gracefully)
- [ ] Expo EAS build: `npx eas build --platform all --profile preview`
- [ ] Test on physical iOS + Android device (MapLibre requires native build)
- [ ] Camera permission tested on both platforms
- [ ] Submission flow tested end-to-end: submit → Supabase → status screen sync
