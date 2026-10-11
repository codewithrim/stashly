# Stashly — Save Now. Find It Later.

**Stashly** is a personal save-for-later Android and cross-platform mobile application built with React Native and Expo. It gives users a focused, organized space to save notes, bookmark web links, and keep visual references without getting lost across fragmented browser tabs, chat threads, or bookmarks.

---

## What is Stashly?

Instead of scattering interesting articles, quick thoughts, and image references across multiple apps, Stashly collects everything into a single, searchable personal library. Every saved item can be categorized, tagged, searched, and archived or restored at any time.

### The Problem It Solves

- **Content Fragmentation**: Useful links, code snippets, articles, and references get lost in browser histories, bookmarks, and chat self-messages.
- **Clutter**: Saving temporary references permanently clutters notes apps. Stashly provides an inbox model with quick archiving and restore capabilities.
- **Lost In-Progress Work**: Unsaved inputs often vanish if an app closes or reloads. Stashly safeguards item creation drafts with local cache recovery.
- **Privacy & Cross-Device Sync**: Personal collections need secure, user-scoped cloud storage with strict Row Level Security (RLS) enforcement.

---

## Features

### Implemented & Verified in Code

- **Save Notes**: Rich text entry with real-time character counting and draft protection.
- **Save Links**: URL validation, domain extraction, and in-app web browser preview using `expo-web-browser`.
- **Save Images**: Image selection from the device library via `expo-image-picker`, uploaded to Supabase Storage (`saved-items` bucket) with secure signed URL resolution.
- **Tagging System**: Add, deduplicate, normalize, and filter items by `#tags`.
- **Search & Filtering**:
  - Live full-text search across titles, contents, URLs, and tags.
  - Category filters: **All**, **Notes**, **Links**, **Images**, and **Archived**.
  - Dynamic category count badges that update in real time.
- **Archive & Restore**: One-tap item archiving from the inbox or detail screen, keeping the main feed clean while preserving items.
- **Draft Protection**: Automatic auto-saving of unfinished items to `AsyncStorage` so inputs are never lost on accidental dismissals or reloads.
- **User Authentication**:
  - Email and password sign-up and sign-in via Supabase Auth (`@supabase/supabase-js`).
  - Session persistence across restarts backed by hardware-backed storage with `expo-secure-store`.
  - Automatic navigation routing: redirects unauthenticated users to `/login` and authenticated users to the inbox `/`.
  - Email verification awareness and user feedback banner.
- **Row Level Security (RLS) & Multi-Tenant Isolation**:
  - Data queries strictly scoped by authenticated `owner_id`.
  - Live verified: unauthenticated reads and writes are blocked by PostgreSQL policies.
- **Android Incoming Share Intent**:
  - Android `SEND` intent filters registered for both `text/plain` and `image/*` in `app.json`.
  - Automatic URL detection (`extractFirstUrl`) that parses shared web links into the URL field and remaining content into notes.
  - Image share support with URI pre-filling directly into the item creation form.
- **Offline Sync Queue**:
  - Local mutation buffer backed by `AsyncStorage` via `queue.service.ts`.
  - Automatic offline fallback: items created while disconnected are preserved optimistically and synced upon reconnecting.
- **Biometric App Lock**:
  - Hardware-backed biometric authentication (Fingerprint, Face ID, PIN) powered by `expo-local-authentication`.
  - Full-screen app lock guard with quick toggle button directly in the Inbox header.
- **Mobile-First UI & Accessibility**:
  - Light and dark theme support (`useColorScheme`).
  - Safe area aware layouts, keyboard-avoiding scroll views, minimum 48dp touch targets, and animated skeleton loaders.

### Future Roadmap Ideas

- **Custom Tag Colors**: Color-coded tag chips for customized visual organization.
- **Export & Backup**: Export collection to JSON or Markdown archives.

---

## Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) (0.86.3) with [Expo SDK 57](https://expo.dev/)
- **Routing & Navigation**: [Expo Router v57](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any` types)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
  - PostgreSQL with Row Level Security (RLS)
  - Supabase Auth (Email & Password)
  - Supabase Storage (`saved-items` bucket)
- **Session Persistence**: [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/)
- **Draft & Cache**: [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/)
- **Media & Browser**: [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [`expo-web-browser`](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- **Testing**: [Jest](https://jestjs.io/) (29.7) + [Jest Expo](https://docs.expo.dev/develop/unit-testing/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) (v14)
- **Code Quality**: ESLint (`eslint-config-expo`), TypeScript Compiler (`tsc`)

---

## Project Structure

```text
stashly/
├── app.json                 # Expo configuration (plugins, scheme, Android intents)
├── babel.config.js          # Babel presets and configuration
├── jest.config.js           # Jest and Jest-Expo testing configuration
├── jest.setup.js            # Mock configurations for AsyncStorage and SecureStore
├── package.json             # Dependencies and project scripts
├── tsconfig.json            # TypeScript path aliases and compiler settings
├── scripts/
│   ├── reset-project.js     # Template starter reset script
│   └── verify-live-rls.js   # Live Supabase RLS security verification script
├── __tests__/               # Comprehensive unit test suites (32 tests)
│   ├── components/          # Tests for ItemCard and ItemForm
│   ├── contexts/            # Tests for items.context state & operations
│   ├── services/            # Tests for items.service and draft.service
│   └── utils/               # Tests for validation and URL extraction
└── src/
    ├── app/                 # Expo Router routes and screens
    │   ├── _layout.tsx      # Root navigator, theme provider, and auth guard
    │   ├── index.tsx        # Inbox screen (search, filter chips, item feed, FAB)
    │   ├── (auth)/          # Authentication group
    │   │   ├── _layout.tsx  # Auth stack layout
    │   │   ├── login.tsx    # Sign-in screen
    │   │   └── signup.tsx   # Sign-up screen with email confirmation banner
    │   └── item/            # Item detail and management screens
    │       ├── new.tsx      # Create item screen (supports share intent params)
    │       ├── [id].tsx     # Item detail screen (signed image viewer, link opener)
    │       └── [id]/
    │           └── edit.tsx # Edit item screen
    ├── components/
    │   ├── items/           # ItemCard, ItemForm, TypeSelector
    │   └── ui/              # Button, Input, TagInput, TagChip, FilterChips,
    │                        # EmptyState, ErrorView, LoadingSkeleton, ConfirmDialog
    ├── constants/
    │   └── theme.ts         # Colors (light/dark), Typography, Spacing, Touch targets
    ├── contexts/
    │   ├── auth.context.tsx # Supabase session and user state manager
    │   └── items.context.tsx# Items state, live filtering, and backend bridge
    ├── hooks/
    │   └── use-theme.ts     # Color scheme and theme hook
    ├── services/
    │   ├── supabase.ts      # Supabase client with SecureStore storage adapter
    │   ├── items.service.ts # PostgreSQL CRUD operations with owner scoping
    │   ├── storage.service.ts # Image uploads and signed URL generation
    │   └── draft.service.ts # Local draft saving and recovery
    ├── types/
    │   ├── database.ts      # Supabase database TypeScript definitions
    │   └── item.ts          # SavedItem, ItemType, and form inputs
    └── utils/
        ├── formatters.ts    # Date formatting and URL domain extractors
        └── validation.ts    # Form validation and URL regex extractors
```

---

## Prerequisites & Setup Instructions

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- `npm` (bundled with Node.js)
- [Expo Go](https://expo.dev/go) on your Android device, or an Android Studio emulator

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codewithrim/stashly.git
   cd stashly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables & Supabase Setup

Stashly uses Supabase for user authentication and cloud data storage.

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

> **Security Note**: Never commit service-role keys or secret tokens. Only `EXPO_PUBLIC_` publishable keys are safe for mobile clients.

### Database Requirements

The application interacts with the `saved_items` table and the `saved-items` storage bucket:

- **Table**: `saved_items` (Columns: `id`, `owner_id`, `type`, `title`, `content`, `url`, `image_path`, `tags`, `is_archived`, `created_at`, `updated_at`).
- **Row Level Security (RLS)**: Must be enabled on `saved_items` so authenticated users can only query, insert, update, and delete rows where `owner_id = auth.uid()`.
- **Storage Bucket**: Private bucket named `saved-items` scoped with storage policies for authenticated owner access.

You can verify your live Supabase configuration and RLS isolation anytime with:
```bash
node scripts/verify-live-rls.js
```

---

## How to Run the App

### Start Development Server

```bash
npx expo start
```

- Press `a` in the terminal to launch on a running Android emulator.
- Scan the printed QR code with **Expo Go** on your physical Android device.

### Quality & Diagnostics Commands

- **Run Unit Tests**:
  ```bash
  npm test
  ```
- **Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Lint Code**:
  ```bash
  npx expo lint
  ```
- **Diagnose Dependencies & Project Health**:
  ```bash
  npx expo-doctor
  ```

---

## Current Development Status

| Feature / Area | Status | Description |
|---|---|---|
| **Design System & UI Components** | Complete | Restrained light/dark theme, accessible buttons, inputs, skeletons, and dialogs. |
| **Inbox & Item Management** | Complete | Search, filtering (All, Notes, Links, Images, Archived), tag filtering, CRUD. |
| **Draft Protection** | Complete | Unsaved inputs preserved in AsyncStorage and restored if interrupted. |
| **Authentication Flow** | Complete | Supabase email/password sign-up, sign-in, and auto-session restoration via SecureStore. |
| **Cloud Database CRUD & RLS** | Complete | User-scoped queries with verified Row Level Security isolation. |
| **Cloud Storage** | Complete | Image uploads and signed URL generation from private bucket. |
| **Android Text & Image Share Intent** | Complete | Android intent filters registered for `text/plain` and `image/*` with automatic field mapping. |
| **Offline Sync Queue** | Complete | Local mutation queue with AsyncStorage buffering and replay upon reconnection. |
| **Biometric App Lock** | Complete | Face ID / Fingerprint lock screen backed by `expo-local-authentication` and SecureStore. |

---

## Roadmap

- [x] Foundation: Design tokens, atomic UI primitives, and draft protection
- [x] Item creation, editing, viewing, and deletion
- [x] Search, category filters, and tag filtering
- [x] Supabase Auth with SecureStore session persistence
- [x] Cloud CRUD with strict Row Level Security
- [x] Supabase storage integration with signed image URLs
- [x] Android text and link sharing intent support
- [x] Android image file sharing intent filter support
- [x] Offline mutation queue with auto-reconnect sync
- [x] Biometric app authentication (Fingerprint / Face ID)

---

## License

This project was built as an academic software engineering mobile application. Free to use and learn from under the [MIT License](LICENSE).
