# AeroMiles — Frequent Flyer Management Portal

A submission-ready, production-grade **End-to-End Frequent Flyer Management Portal** designed for airline floor staff to manage frequent flyer members, tier distributions, and miles transactions securely, efficiently, and reliably.

---

## 1. Project Overview & Features

### Core Capabilities
- **Real-Time Operational Dashboard**:
  - Live metric synchronization: Total Members, Active Ratio, Total Accumulated Miles, and Tier Distribution across Platinum, Gold, Silver, and Bronze.
  - Automatically recalculates on member registration, profile updates, account deletion, or mileage transactions.
- **Full Member Management (CRUD)**:
  - **Create Member**: Register new frequent flyer profiles with unique membership number auto-generation (`FF-XXXXX`), status assignment, and tier selection.
  - **View Details**: Dedicated profile view displaying complete member metadata and historical mileage transaction ledgers.
  - **Edit Member**: Seamless updates to contact info, tier status, and account standing.
  - **Delete Member**: Safe two-step deletion with an accessible confirmation dialog and ledger cleanup.
- **Search, Filter & Sorting**:
  - Instant text search matching member names, email addresses, or membership numbers.
  - Dropdown filters for membership tier and account status.
  - Multi-column sorting (Name, Tier level, Accumulated Miles, Registration Date).
- **Miles Transaction Ledger**:
  - Support for **Earn** (credit) and **Redeem** (debit) transactions.
  - Single source of truth for balances with atomic ledger recording.
  - Balance protection safeguards preventing overdrafts or negative miles.
- **Enterprise Design & Polish**:
  - Monochromatic corporate airline aesthetic (white, black, and slate neutral surfaces).
  - Subtle micro-animations with strict `@media (prefers-reduced-motion: reduce)` compliance.
  - Accessible toast notifications (`role="alert"`), loading spinners, and empty states.
- **Analytics Simulation**:
  - Centralized logger emitting `[Analytics] User interacted with End-to-End Frequent Flyer Portal` strictly on successful completion of primary actions.

---

## 2. Technology Stack

- **Frontend Core**: [React 18](https://react.dev/), [TypeScript 5.7](https://www.typescriptlang.org/)
- **Build Tool & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: Vanilla CSS with centralized design tokens and CSS variables
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest 3](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [jest-dom](https://github.com/testing-library/jest-dom), [user-event](https://github.com/testing-library/user-event)
- **Code Quality**: ESLint 9 (Flat Config), TypeScript Compiler (`tsc`)

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or later (tested on Node v24.15.0)
- **npm**: v9.0.0 or later (tested on npm 11.12.1)

---

## 4. Installation & Setup

1. **Clone or Navigate to the Workspace Directory**:
   ```bash
   cd "/Users/bajrangdan/Downloads/sprint 4/client project 4"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

---

## 5. Running the Application

### Development Server
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Preview
Build the optimized production assets:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 6. Testing, Linting & Type Checking

### Run Automated Tests (Vitest)
Executes all 25 happy-path and unhappy-path test scenarios:
```bash
npm run test
```

### Type Checking
Ensures strict TypeScript compilation with zero errors:
```bash
npm run typecheck
```

### Linting
Validates code style and hooks with zero warnings:
```bash
npm run lint
```

---

## 7. Architecture & Data Persistence

### Local Enterprise Service Layer
The application uses a simulated asynchronous service layer in `src/services/memberService.ts`:
- **Persistence**: Employs browser `localStorage` under keys `aero_members_data` and `aero_transactions_data`.
- **Defensive Recovery**: In the event of storage corruption (e.g. malformed JSON or schema changes), the service gracefully logs a warning and recovers without throwing uncaught exceptions.
- **Asynchronous Reality**: Methods return native `Promise` objects with simulated network latency to test loading states, debouncing, and disabled submission buttons.
- **Atomic Operations**: Adding transactions updates the member's balance and ledger record atomically.

---

## 8. Security & Accessibility

### Security Safeguards
- **XSS Protection**: Zero use of `eval` or `dangerouslySetInnerHTML`. Inputs are safely sanitized via `sanitizeString` removing script protocols and injection payloads.
- **Service-Boundary Validation**: Form inputs are validated both at the UI layer and verified in the service logic (valid email regex, non-negative integer miles, duplicate number prevention).
- **No Hardcoded Secrets**: Zero API keys or real personal data present in the codebase. Synthetic sample profiles are used exclusively.

### Accessibility Highlights
- **Semantic HTML**: Proper landmarks (`<header role="banner">`, `<main role="main">`, `<table>`, `<dialog>`).
- **Explicit Labels**: 100% of form inputs use matching `<label htmlFor="...">` bindings.
- **Error Linkage**: Invalid fields dynamically receive `aria-invalid="true"` and `aria-describedby` pointing to field error messages.
- **Keyboard Navigation**: Full tab ordering, focus trapping inside dialogs, and `Escape` key listeners to dismiss modals.
- **Visual Contrast**: High-contrast monochromatic styling meeting WCAG AA/AAA standards, paired with visible focus rings (`:focus-visible`).

---

## 9. Known Limitations & Future Roadmap

- **Backend Integration**: Currently operates with a robust client-side persistence service. In a future iteration, an enterprise REST/GraphQL backend with JWT floor-staff authentication can be plugged in by swapping `src/services/memberService.ts`.
- **Multi-Airline Alliance Sync**: Can be extended to support SkyTeam / Star Alliance cross-carrier mileage redemption protocols.
