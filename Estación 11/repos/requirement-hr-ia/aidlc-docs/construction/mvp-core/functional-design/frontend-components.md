# Frontend Components — Unit 1: MVP Core

## Technology
- **Framework**: Next.js 16 App Router (React Server Components + Client Components)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Server Components for data fetching, client state minimal (form handling only)
- **Auth**: NextAuth.js with Cognito provider (session-based)

---

## Page Structure

```
app/
├── page.tsx                           # Landing → redirect to /login or /dashboard
├── login/page.tsx                     # Cognito login (NextAuth signIn)
│
├── (dashboard)/                       # Protected route group (requires auth)
│   ├── layout.tsx                     # Dashboard shell: sidebar + header + content
│   │
│   ├── page.tsx                       # Dashboard home (redirect to /campaigns)
│   │
│   ├── campaigns/
│   │   ├── page.tsx                   # Campaign list
│   │   ├── new/page.tsx              # Create campaign form
│   │   └── [campaignId]/
│   │       ├── page.tsx               # Campaign detail + edit
│   │       └── candidates/page.tsx   # Candidates for this campaign
│   │
│   ├── review/
│   │   ├── page.tsx                   # HITL review queue (all campaigns)
│   │   └── [candidateId]/page.tsx    # Candidate detail + review decision
│   │
│   └── settings/page.tsx             # Account settings (minimal for MVP)
```

---

## Component Hierarchy

### Layout Components

**DashboardLayout** (`(dashboard)/layout.tsx`)
- Server Component
- Validates auth session (redirect to /login if unauthenticated)
- Renders: Sidebar + Header + Main content area
- shadcn/ui: `Sheet` (mobile sidebar), custom layout

**Sidebar** (`components/layout/Sidebar.tsx`)
- Client Component (collapsible on mobile)
- Navigation links: Campañas, Revisión, Configuración
- Active state based on current route
- shadcn/ui: `Button`, `Sheet`

**Header** (`components/layout/Header.tsx`)
- Server Component
- Displays: tenant name, user email, logout button
- shadcn/ui: `Avatar`, `DropdownMenu`, `Button`

### Campaign Pages

**CampaignListPage** (`campaigns/page.tsx`)
- Server Component — fetches campaigns via API
- Displays: table/cards with name, status, candidate count, Telegram link
- Actions: Create new, copy Telegram link, activate/deactivate
- shadcn/ui: `Table`, `Badge` (status), `Button`, `DropdownMenu`

**CreateCampaignPage** (`campaigns/new/page.tsx`)
- Client Component (form handling)
- Form fields: name, role description, rubric template (select BPO/Tech), basic requirements, knowledge base text (textarea), career page URL
- Validation: BR-06.1 (name + role + rubric required)
- On submit: POST /api/campaigns → redirect to campaign detail
- shadcn/ui: `Card`, `Input`, `Textarea`, `Select`, `Button`, `Label`, `Form`

**CampaignDetailPage** (`campaigns/[campaignId]/page.tsx`)
- Server Component + Client interactions
- Sections:
  - Campaign info (editable)
  - Telegram link with copy button
  - Rubric display (read-only for MVP — hardcoded templates)
  - Basic requirements list
  - Quick stats: total candidates, completed, pending review
- shadcn/ui: `Card`, `Tabs`, `Badge`, `Button`, `Input`

### Review Pages

**ReviewQueuePage** (`review/page.tsx`)
- Server Component with client-side filters
- Filters bar: campaign (select), recommendation (multi-select), score range, date range
- Table columns: candidate name/ID, campaign, score, recommendation, date, status
- Sortable columns: score, date
- Click row → navigate to candidate detail
- shadcn/ui: `Table`, `Select`, `Badge`, `Input` (date), `Button`

**CandidateReviewPage** (`review/[candidateId]/page.tsx`)
- Mixed: Server Component (data) + Client Component (decision form)
- Three sections:
  1. **Summary Card**: Global score, recommendation badge, key signals
  2. **Competency Breakdown**: Accordion — each competency shows score bar + evidence quotes
  3. **Transcript**: Collapsible full conversation transcript
- Decision panel (sticky bottom):
  - "Aprobar" (green) / "Rechazar" (red) buttons
  - Optional reason textarea
  - IF decision differs from recommendation: mandatory disagreement reason field
  - Confirm dialog before submitting
- shadcn/ui: `Card`, `Badge`, `Progress` (score bar), `Accordion`, `Button`, `Textarea`, `Dialog`, `Alert`

### Shared Components

**ScoreBadge** (`components/shared/ScoreBadge.tsx`)
- Displays score with color coding: ≥4 green, ≥3 yellow, <3 red
- Props: `score: number`, `size?: 'sm' | 'md' | 'lg'`

**RecommendationBadge** (`components/shared/RecommendationBadge.tsx`)
- shadcn/ui `Badge` variant
- highly_recommended: green, recommended: yellow, not_recommended: red
- Props: `recommendation: Recommendation`

**TranscriptViewer** (`components/shared/TranscriptViewer.tsx`)
- Chat-style message display
- Agent messages: left-aligned, gray background
- Candidate messages: right-aligned, blue background
- Timestamp per message
- Props: `messages: Message[]`

**EvidenceQuote** (`components/shared/EvidenceQuote.tsx`)
- Styled blockquote with candidate's verbatim text
- Link to transcript position (messageIndex)
- Props: `evidence: Evidence`

**EmptyState** (`components/shared/EmptyState.tsx`)
- Illustration + message for empty lists
- Props: `title: string`, `description: string`, `action?: { label: string, href: string }`

---

## API Integration Points

| Component | API Endpoint | Method | Purpose |
|---|---|---|---|
| CampaignListPage | `/api/campaigns` | GET | Fetch tenant campaigns |
| CreateCampaignPage | `/api/campaigns` | POST | Create campaign |
| CampaignDetailPage | `/api/campaigns/[id]` | GET, PUT | Read/update campaign |
| ReviewQueuePage | `/api/candidates?status=pending_review` | GET | Fetch review queue |
| CandidateReviewPage | `/api/candidates/[id]` | GET | Fetch candidate + evaluation |
| CandidateReviewPage | `/api/candidates/[id]/review` | POST | Submit review decision |

---

## Form Validation Rules

| Form | Field | Validation |
|---|---|---|
| Create Campaign | name | Required, 1-200 chars |
| Create Campaign | roleDescription | Required, 1-2000 chars |
| Create Campaign | rubric template | Required (select one: BPO or Tech) |
| Review Decision | decision | Required (approve or reject) |
| Review Decision | disagreementReason | Required IF decision ≠ AI recommendation |
| Review Decision | reason | Optional, max 1000 chars |
