# Domain Entities — Unit 1: MVP Core

## Entity Relationship Overview

```
Tenant (1) ──── (*) Campaign (1) ──── (1) Rubric
                     │
                     │ (1)────(*)
                     │
                 Candidate (1) ──── (1) Conversation (1) ──── (1) Evaluation
                     │                     │
                     │                     │ (1)────(*)
                     │                     │
                     │                   Message
                     │
                     └──── (1) ConsentRecord

                 AuditEvent (independent — cross-cutting)
```

---

## E1: Tenant

```typescript
interface Tenant {
  tenantId: string;           // PK — UUID
  name: string;               // Organization name
  careerPageUrl?: string;     // Optional — used for invalid campaign redirect
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**DynamoDB Table**: `Tenants`
- PK: `tenantId`
- No SK needed (single-item access)

---

## E2: Campaign

```typescript
interface Campaign {
  tenantId: string;           // PK — partition key for tenant isolation
  campaignId: string;         // SK — UUID
  name: string;               // Display name
  roleDescription: string;    // Job role description
  rubricId: string;           // Reference to rubric
  rubric: Rubric;             // Embedded rubric (denormalized for read performance)
  telegramLink: string;       // Generated: https://t.me/{bot}?start={campaignId}
  status: CampaignStatus;     // 'draft' | 'active' | 'inactive' | 'archived'
  basicRequirements: BasicRequirement[];
  knowledgeBaseContent?: string;  // MVP: plain text (in-context loading)
  careerPageUrl?: string;     // Override tenant-level career page
  createdAt: string;
  updatedAt: string;
}

type CampaignStatus = 'draft' | 'active' | 'inactive' | 'archived';

interface BasicRequirement {
  id: string;
  field: string;              // e.g., "availability", "location", "documentation"
  question: string;           // Question text in Spanish
  type: 'text' | 'boolean' | 'choice';
  mandatory: boolean;
  options?: string[];         // For 'choice' type
  expectedAnswer?: string;    // For 'boolean' — expected value to pass
}
```

**DynamoDB Table**: `Campaigns`
- PK: `tenantId`, SK: `campaignId`

---

## E3: Rubric

```typescript
interface Rubric {
  rubricId: string;           // UUID
  tenantId: string;
  name: string;               // e.g., "BPO - Agente de Servicio"
  template: 'bpo' | 'tech';  // MVP: hardcoded templates only
  competencies: Competency[];
  createdAt: string;
}

interface Competency {
  competencyId: string;       // UUID
  name: string;               // e.g., "Comunicación"
  description: string;        // What this competency evaluates
  weight: number;             // 0.0-1.0, all weights sum to 1.0
  sampleQuestion: string;     // Suggested question for the AI agent
  criteria: ScoreCriteria;
}

interface ScoreCriteria {
  1: string;  // "No demuestra la competencia..."
  2: string;  // "Demuestra de forma limitada..."
  3: string;  // "Demuestra de forma adecuada..."
  4: string;  // "Demuestra de forma destacada..."
  5: string;  // "Demuestra de forma excepcional..."
}
```

**Storage**: Embedded within Campaign document (denormalized). Also stored independently for template reuse.

---

## E4: Candidate

```typescript
interface Candidate {
  tenantId: string;           // PK
  candidateId: string;        // SK — UUID
  telegramUserId: string;     // Telegram user identifier
  telegramChatId: number;     // Telegram chat ID for sending messages
  campaignId: string;         // Associated campaign
  conversationId?: string;    // Link to conversation
  name?: string;              // Extracted during conversation (optional)
  state: CandidateState;
  reviewDecision?: ReviewDecision;
  createdAt: string;
  updatedAt: string;
}

type CandidateState =
  | 'initiated'       // Clicked link, conversation not started
  | 'in_screening'    // Actively in screening
  | 'completed'       // Screening finished, evaluation pending
  | 'pending_review'  // Evaluation generated, awaiting HITL
  | 'approved'        // Recruiter approved
  | 'rejected';       // Recruiter rejected

interface ReviewDecision {
  decision: 'approved' | 'rejected';
  reviewerId: string;         // Cognito user ID
  reason?: string;            // Optional reason
  disagreesWithAI: boolean;
  disagreementReason?: string; // Mandatory if disagreesWithAI = true
  decidedAt: string;          // ISO 8601
}
```

**DynamoDB Table**: `Candidates`
- PK: `tenantId`, SK: `candidateId`
- GSI `Candidates-ByCampaign`: PK=`campaignId`, SK=`state`
- GSI `Candidates-ByTelegram`: PK=`telegramUserId`, SK=`tenantId`

---

## E5: Conversation

```typescript
interface Conversation {
  tenantId: string;           // PK
  conversationId: string;     // SK — UUID
  campaignId: string;
  candidateId: string;
  state: ConversationState;
  sessionState: SessionState;
  messages: Message[];        // Embedded message array
  createdAt: string;
  updatedAt: string;
}

type ConversationState = 'active' | 'paused' | 'abandoned' | 'completed';

interface SessionState {
  currentPhase: 'onboarding' | 'consent' | 'verification' | 'screening' | 'closing';
  competenciesCovered: string[];          // competencyIds that have been asked
  currentCompetencyId?: string;           // Currently being evaluated
  followUpAsked: boolean;                 // Has follow-up been asked for current competency?
  questionsAsked: number;                 // Total questions asked
  verificationResults: Record<string, string>; // requirement field → candidate answer
  escalationCount: number;                // Times bot said "No tengo esa información"
  lastActivityAt: string;                 // ISO 8601
}

interface Message {
  messageId: string;          // UUID
  role: 'agent' | 'candidate';
  content: string;
  timestamp: string;          // ISO 8601
  phase: string;              // Phase when message was sent
}
```

**DynamoDB Table**: `Conversations`
- PK: `tenantId`, SK: `conversationId`
- GSI `Conversations-ByTelegram`: PK=`telegramUserId#campaignId`, SK=`conversationId`

---

## E6: Evaluation (Executive Summary)

```typescript
interface Evaluation {
  tenantId: string;           // PK
  conversationId: string;     // SK — one evaluation per conversation
  campaignId: string;
  candidateId: string;
  globalScore: number;        // Weighted average, 1.0-5.0
  recommendation: Recommendation;
  competencyScores: CompetencyScore[];
  keySignals: string[];       // 2-3 key observations
  generatedAt: string;        // ISO 8601
}

type Recommendation = 'highly_recommended' | 'recommended' | 'not_recommended';

interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  score: number;              // 1-5
  weight: number;             // From rubric
  evidence: Evidence[];
  justification: string;      // Evaluator's reasoning
}

interface Evidence {
  quote: string;              // Verbatim candidate text
  messageIndex: number;       // Index in conversation messages array
  relevance: string;          // Why this quote supports the score
}
```

**DynamoDB Table**: `Evaluations`
- PK: `tenantId`, SK: `conversationId`

---

## E7: ConsentRecord

```typescript
interface ConsentRecord {
  tenantId: string;           // PK
  candidateId: string;        // SK
  granted: boolean;
  telegramUserId: string;
  campaignId: string;
  timestamp: string;          // ISO 8601 — immutable
}
```

**DynamoDB Table**: `Consent`
- PK: `tenantId`, SK: `candidateId`

---

## E8: AuditEvent

```typescript
interface AuditEvent {
  tenantId: string;           // PK
  eventId: string;            // SK — timestamp#uuid for chronological ordering
  eventType: AuditEventType;
  entityId: string;           // ID of the affected entity
  entityType: 'conversation' | 'candidate' | 'evaluation' | 'campaign';
  details: Record<string, unknown>;
  actorId: string;            // Telegram userId, Cognito userId, or 'system'
  actorType: 'system' | 'recruiter' | 'candidate';
  timestamp: string;          // ISO 8601
}

type AuditEventType =
  | 'consent_granted'
  | 'consent_denied'
  | 'screening_started'
  | 'screening_completed'
  | 'screening_abandoned'
  | 'evaluation_generated'
  | 'candidate_approved'
  | 'candidate_rejected'
  | 'escalation_triggered';
```

**DynamoDB Table**: `AuditEvents`
- PK: `tenantId`, SK: `timestamp#eventId` (chronological order, append-only)
