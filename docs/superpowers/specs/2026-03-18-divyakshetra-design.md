# DivyaKshetra — UI/UX Design Specification

**Date:** 2026-03-18
**Type:** Mobile App (React Native / Expo)
**Status:** Approved for implementation planning

---

## 1. Product Overview

DivyaKshetra is a community-driven spiritual map of India for discovering Hindu temples, Siddhar/Yogi samadhi places, ashrams, and sacred sites. It is a zero-login, privacy-first NGO app — users can browse, discover, and contribute places without creating an account.

### Core philosophy
> "A sacred discovery experience — not a data submission tool."

### Constraints
- No login, no signup, no user profiles
- No personal data collection
- No gamification tied to identity
- No social features
- Near-zero operating cost (NGO)

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Platform | React Native (Expo) | Cross-platform iOS + Android, TypeScript, NGO-friendly free tier |
| Map | MapLibre React Native + OpenStreetMap free tiles | Fully open source, $0, best OSM integration, supports custom tile styling |
| Navigation | Expo Router | File-based routing, well-supported |
| Storage (local) | AsyncStorage / SQLite (expo-sqlite) | Submission status stored on-device, no login required |
| Backend | Supabase free tier | Postgres + REST + realtime, generous free tier for NGO scale |
| Submission tracking | Local device token + submission code | Users recover their submissions without an account |

---

## 3. Design Language

### 3.1 Visual Theme
**Warm Temple Stone** — sandalwood, saffron, terracotta, gold accents on off-white parchment.

### 3.2 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| Deep Ebony | `#1C0F08` | Deepest backgrounds, nav bars, overlays |
| Temple Brown | `#3D2010` | Cards, bottom sheets, dark surfaces |
| Sandalwood | `#F5E6C8` | Primary background, surface colour |
| Sacred Gold | `#E8C06A` | CTAs highlights, active states, progress indicators |
| Saffron | `#C0541A` | Primary action colour, Temple category, CTA buttons |
| Terracotta | `#7A4A2A` | Secondary text, dividers, inactive states |
| Verified Green | `#2E7D32` | Approved/verified status only |

### 3.3 Typography
- **Headings:** Georgia / Tiro Devanagari (serif) — place names, screen titles
- **Body / UI:** System sans-serif — distances, metadata, labels
- **Metadata:** Italic Georgia — timings, descriptions, deity lines
- Devanagari subtitle (दिव्यक्षेत्र) shown on splash — affirms cultural identity from first open

### 3.4 Category System

| Category | Emoji | Badge Colour |
|---|---|---|
| Temple | 🛕 | Saffron `#C0541A` |
| Samadhi | 🧘 | Sacred Gold `#E8C06A` |
| Ashram | 🌿 | Terracotta `#7A4A2A` |
| Sacred Water | 💧 | Deep Blue-Brown `#3D4A6A` |

### 3.5 Map Markers
Custom spiritual pins: category emoji inside a circle (category colour fill, gold/parchment border), tapered stem, drop shadow. Non-selected markers dim to 40% opacity when a bottom sheet is open. Selected marker gets a gold glow ring + 1.15× scale.

### 3.6 Submission Status Badges

| Status | Style |
|---|---|
| Under Review | Amber — `#FFF3CD` bg, `#856404` text, gold border |
| Approved | Green — `#E8F5E9` bg, `#2E7D32` text |
| Not Approved | Red — `#FFEBEE` bg, `#C62828` text |

---

## 4. Screen Specifications

### 4.1 Screen 1 — Home (Map View)

**Default state:**
- Full-screen MapLibre map with Warm Temple Stone parchment tile style
- Status bar (dark, transparent)
- Search bar floated below status bar (sandalwood bg, full width with padding)
  - Placeholder: "Search temples, deities, places…"
  - Microphone icon (right)
- Horizontally scrollable filter chips below search bar
  - Categories: All / Temple / Samadhi / Ashram / Sacred Water / Nearby
  - "Temple" active by default
- Spiritual map markers rendered per category
- User location dot (blue `#4A90E2`, white border, soft glow ring — GPS convention)
- Locate button (bottom-right, above toggle)
- Map ↔ List floating toggle pill (centred, above bottom safe area)

**Marker tapped state (bottom sheet — peek):**
- Non-selected markers dim to 40% opacity
- Selected marker: gold glow ring, 1.15× scale
- Half-sheet slides up from bottom:
  - Handle bar
  - Hero image (temple photo / category gradient placeholder)
  - "Recently Verified" badge (green, top-right of image — conditional)
  - Place name (serif bold)
  - Deity / spiritual figure line (italic)
  - Distance + category badge row
  - "View Details →" full-width CTA (saffron)
- Swipe up → full Place Details screen
- Tap outside → dismiss sheet

**Loading / Splash state:**
- Sandalwood full-screen background
- 🪔 flame lamp icon (large)
- "DivyaKshetra" serif title
- "दिव्यक्षेत्र" Devanagari subtitle
- "Sacred Places of India" English caption
- Gold divider line
- "Finding sacred places near you…" status text
- Shimmer loading bars

---

### 4.2 Screen 2 — Place Details

**Layout:** Scrollable screen. Fixed bottom bar (Share + Get Directions).

**Verified place:**
- Hero image (temple photo / gradient placeholder) — full-width, 210px height
  - Back button (←, dark circle, top-left)
  - "✓ Recently Verified" green badge (top-right, conditional)
  - Image dot-indicator carousel (bottom of hero, swiping shows more photos)
- Place name (serif bold, large)
- Deity / spiritual figure line (italic, terracotta)
- Category badge + distance + location row
- Community rating row (star icons, "community" label)
- Map snippet (80px, tappable — opens native maps)
  - "▶ Navigate" CTA (saffron, bottom-right of snippet)
- **About section** (serif section title with rule)
  - Description text
- **Timings & Details section**
  - 2×2 info card grid: Darshan Hours / Special Rituals / Nearest City / Entry
- **Photos section**
  - Horizontal scrollable thumbnail strip
  - Last thumb is a soft "+ Add" slot (dashed border)
- **Actions row** (subtle, below photos)
  - "✏️ Suggest Edit" (saffron outline)
  - "⚑ Report Issue" (terracotta outline, visually quieter)
- Fixed bottom bar: Share icon button + "▶ Get Directions" full CTA

**Newly added / pending state:**
- No verified badge
- Amber review banner below title row: "Under Community Review — details may change"
- "Suggest Edit" button disabled + labelled "Edits Paused During Review"
- Info cards shown at reduced opacity
- Map snippet shows "Approx. location" label

---

### 4.3 Screen 3 — Add New Place (5-step flow)

Common header across all steps:
- Dark nav bar: ← back arrow / "Add Sacred Place" title / Cancel
- 5-segment dot progress bar (done = gold, active = saffron, todo = dim white)
- "Step N of 5 — Label" caption below dots

**Step 1 — Location**
- Heading: "Where is this place?"
- Sub: "Accurate placement improves approval chances."
- Full-width MapLibre map (200px height, rounded corners)
  - New place pin: gold-glow adjustable pin (+ icon, pulsing ring), draggable
  - Nearby existing places shown as dimmed markers
  - "✥ Drag pin to adjust" hint overlay
- Amber warning banner if existing place found within ~200m: "N places already nearby. Please check they're not the same."
- Helper text: "📍 Accurate location improves approval chances"
- CTA: "Confirm Location →"

**Step 2 — Basic Info**
- Heading: "About this place"
- Fields (all with sandalwood-bg inputs):
  - Place Name * (text)
  - Category * (2×2 icon grid — tap to select one)
  - Deity / Spiritual Figure (text, optional)
  - State / District (text)
- Focused field: saffron border + soft glow ring
- CTA: "Next: Add Photos →"

**Step 3 — Photos** *(highlighted step)*
- Heading: "Add Photos"
- Sub: "Clear photos help our team verify your submission faster."
- Large primary camera CTA (dashed saffron border, 130px height):
  - 📸 icon
  - "Take a Photo" bold label
  - "Clear temple photos help faster approval" caption
- Green quality hint card: "Photos with clear view of the main entrance or shrine significantly improve approval chances."
- Additional photo slots row (3× empty dashed thumbs)
- Already-added thumbs show green ✓ badge
- "Skip for now — you can add photos later" in small muted text (below)
- **Photo re-entry:** The "+ Add" slot in Place Details (Section 4.2) is the post-submission re-entry point. It is disabled while the place is Under Review. It becomes active only after the place is Approved.
- CTA: "Next: More Details →"

**Step 4 — Additional Details**
- Heading: "Tell us more"
- Sub: "All fields below are optional — share what you know."
- Textarea: Description (72px)
- Optional fields: Timings / Entry & Offerings / Best time to visit
- Micro-copy: "More details = faster verification ✓"
- CTA: "Review Submission →"

**Step 5 — Review & Submit**
- Heading: "Review your submission"
- Sub: "Our team will verify before it appears on the map."
- Summary card (gold-tinted bg):
  - Name / Category / Deity / Location / Photos count
- Photo preview row (thumbs of uploaded images)
- Disclaimer text: "Your submission is anonymous."
- CTA: **"Submit for Review 🙏"** (gradient saffron, large)

---

### 4.4 Screen 4 — Submission Status

**Access model:** Submissions stored in device AsyncStorage keyed to a local session token (UUID v4, generated on first launch). Users shown a **submission code** (first 8 chars of UUID, uppercase, e.g. `A3F7B2C1`) displayed in a "Recovery" section within the Submission Status screen. To recover submissions on a new device, user enters this code in Settings → "Recover My Submissions" — the app fetches submissions matching that token from Supabase. No login required.

**List view:**
- Dark nav bar: "My Submissions" title + "Stored on this device · No account needed" caption
- Access hint banner: device-storage explanation + submission code recovery note
- Submission cards (collapsible):
  - Thumb image (category gradient)
  - Place name (serif bold, truncated)
  - Location + category sub-line
  - Status badge (Under Review / Approved / Not Approved)
  - Submission date
  - Expand chevron (▼ / ▲)

**Expanded — Approved:**
- Detail rows: Category / Deity / Photos
- Green explanation: "Your submission is now live on the map. Thank you for contributing to DivyaKshetra!"

**Expanded — Under Review:**
- Detail rows (standard)
- Amber explanation: review in progress, estimated timeline if known

**Expanded — Not Approved (Rejection):**
- Red explanation card
- **Reason block** (specific, constructive): tells user exactly what was missing
- "↺ Resubmit with More Details" saffron CTA

**Empty state:**
- 🙏 icon
- "No submissions yet" serif title
- "Know a temple, samadhi, or ashram that's not on the map? Help the community discover it."
- "+ Add a Sacred Place" saffron CTA

---

### 4.5 Screen 5 — Search & Discovery

**Layout:** Persistent search header (dark bg) + scrollable results body.

Search header:
- Search input (sandalwood bg, full-width)
  - Query text with ✕ clear button when active
- Horizontally scrollable filter chips: All / Temple / Samadhi / Ashram / Sacred Water
  - Active chip shows result count, e.g. "Temple (22)"

**Default state (no query):**
- Section: "Recent Searches" — dismissible pill chips (local storage, ✕ to remove each)
- Section: "Nearby Sacred Places" — result rows sorted by distance

**Typeahead state (typing):**
- Section: "Suggestions"
  - Matched substring highlighted in saffron
  - Each row: category icon / place name / category tag
  - Last row: "Search all '[query]'" → full results
- Section: "By Deity" — deity-level suggestions (e.g., "Lord Murugan (Kartikeya)")

**Results state:**
- Result count in section label
- Result rows: thumb / place name (with highlighted match) / location + verified badge / distance
- "Recently Added" badge on newly submitted places (builds awareness of community activity)
- Infinite scroll (load more on demand)

---

## 5. UX Intelligence Layer

These UX decisions support backend validation quality without exposing anti-spam mechanisms to users:

| Mechanism | Screen | Implementation |
|---|---|---|
| Nearby duplicate warning | Add Step 1 | Query places within ~200m of dropped pin; show amber banner if found |
| Photo quality nudge | Add Step 3 | Green hint card; large camera CTA; skip is available but small |
| Accurate location nudge | Add Step 1 | Helper text below map |
| "More details = faster verification" | Add Step 4 | Micro-copy below optional fields |
| Resubmit path on rejection | Status Screen | "Resubmit" CTA with specific reason shown |
| Edits paused during review | Place Details | "Suggest Edit" disabled while under review |

---

## 6. Navigation Architecture

```
Tab Bar (bottom, 4 tabs)
├── 🗺  Explore       → Home (Map / List toggle)
├── 🔍  Search        → Search & Discovery
├── ➕  Add           → Add New Place (Step 1)
└── 📋  My Submissions → Submission Status
```

Navigation patterns:
- Map marker tap → bottom sheet peek → swipe/tap → Place Details (push)
- Bottom sheet "View Details →" → Place Details (push)
- Search result tap → Place Details (push)
- Place Details "Suggest Edit" → Add New Place (Step 2 pre-filled, **edit mode**):
  - Progress bar title changes to "Suggest an Edit"
  - Submission routed to a separate `suggested_edits` backend table (not the same as a new place submission)
  - Step 1 (Location) is skipped — location is not editable via Suggest Edit
  - Step 5 CTA reads "Submit Suggestion 🙏" instead of "Submit for Review 🙏"
- Status card "Resubmit" → Add New Place (Step 1, pre-filled from original)

---

## 7. Empty & Loading States

| Screen | Loading | Empty |
|---|---|---|
| Home | Splash (🪔, shimmer) | Map with no markers — "No places found in this area. Be the first to add one." |
| Place Details | Skeleton shimmer on hero + info cards | N/A (always navigated to from a known place) |
| Search | Shimmer result rows | "No results for '[query]'. Know this place? Add it →" |
| Submission Status | — | 🙏 "No submissions yet" + Add CTA |

---

## 8. Accessibility & Internationalisation

- All interactive elements minimum 44×44pt touch target
- Category emoji used alongside text labels (not emoji-only)
- Screen reader labels on all icon-only buttons (← back, ✕ clear, ▶ navigate)
- English UI with Devanagari on splash; full i18n (Tamil, Hindi, Telugu, Kannada) planned for v2
- Map tiles accessible in offline-degraded mode (cached tiles via MapLibre offline packs)

---

## 9. Out of Scope (v1)

- User profiles or accounts
- Social features (comments, likes, following)
- Gamification tied to identity
- Offline-first full sync
- Multi-language UI (v2)
- Admin/moderation dashboard (separate web app, not in scope here)
