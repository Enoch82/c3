# Business Logic Model — Unit 1: MVP Core

## 1. Conversation State Machine

### 1.1 Session Phases

```
┌───────────┐    consent     ┌───────────┐   requirements   ┌──────────────┐
│ ONBOARDING├───────────────►│  CONSENT  ├─────────────────►│ VERIFICATION │
│           │                │           │                   │              │
└───────────┘                └─────┬─────┘                   └──────┬───────┘
                                   │ denied                         │ passed
                                   v                                v
                             ┌──────────┐                    ┌───────────┐
                             │ CLOSED   │                    │ SCREENING │
                             │ (no eval)│                    │           │
                             └──────────┘                    └─────┬─────┘
                                                                   │ all competencies done
                                                                   v
                                                             ┌───────────┐
                                                             │  CLOSING  │
                                                             │           │
                                                             └───────────┘
```

### 1.2 Phase Transitions

| From | To | Trigger | Actions |
|---|---|---|---|
| `onboarding` | `consent` | Bot displays AI disclaimer + purpose | Log audit: screening_started |
| `consent` | `verification` | Candidate responds affirmatively | Log audit: consent_granted. Create ConsentRecord |
| `consent` | `closed` | Candidate declines | Log audit: consent_denied. End session gracefully |
| `verification` | `screening` | All mandatory requirements met | Update SessionState.currentPhase |
| `verification` | `closed` | Mandatory requirement failed | Inform candidate, end gracefully |
| `screening` | `screening` | Competency question asked/answered | Update competenciesCovered, questionsAsked |
| `screening` | `closing` | All rubric competencies covered (each with up to 1 follow-up) | Trigger evaluation (dual-pass) |
| `closing` | `completed` | Bot delivers closing message + next steps | Log audit: screening_completed. Update candidate state |

### 1.3 Conversation States (Session Level)

| State | Meaning | Allowed Actions |
|---|---|---|
| `active` | Candidate is engaged in conversation | Process messages, transition phases |
| `paused` | Candidate stopped responding (>5 min) | Send "Tómate tu tiempo" message. Accept resume |
| `abandoned` | No response after 72h | Mark session closed. No further messages |
| `completed` | Screening finished normally | Trigger evaluation. No further conversation |

### 1.4 Message Processing Flow

```
Telegram Message Received
  │
  ├─ Is conversation found?
  │   ├─ NO → Is valid campaign link?
  │   │        ├─ YES → Create new conversation → ONBOARDING
  │   │        └─ NO → Send redirect message (career page or "enlace no válido")
  │   │
  │   └─ YES → What is conversation state?
  │        ├─ active → Route to current phase handler
  │        ├─ paused → Resume: restore context → Route to current phase handler
  │        ├─ completed → "Tu entrevista ya fue completada. Gracias."
  │        └─ abandoned → "Tu sesión ha expirado. Contacta al reclutador."
  │
  └─ Phase Handlers:
       ├─ ONBOARDING → Display AI disclaimer, transition to CONSENT
       ├─ CONSENT → Parse affirmative/negative response
       ├─ VERIFICATION → Check requirements one by one
       ├─ SCREENING → Process competency Q&A (see §2)
       └─ CLOSING → Thank candidate, explain next steps
```

---

## 2. Screening Logic (Dual-Pass Evaluation)

### 2.1 Conversation Agent (Pass 1)

The conversation agent conducts the interview. It does NOT score — it only converses.

**System Prompt Structure**:
```
ROLE: You are an AI interviewer conducting a screening for [role_name] at [company].
LANGUAGE: Respond always in Spanish neutro.
RUBRIC COMPETENCIES: [list competency names + descriptions]
RULES:
- Ask ONE question per competency
- After the candidate responds, ask exactly ONE follow-up question to deepen understanding
- After the follow-up response, move to the next competency
- NEVER mention scores, evaluations, or rubric levels
- NEVER speculate about salary, benefits, or company policies
- If asked about salary/benefits: "No tengo esa información. El equipo de reclutamiento te dará los detalles en la siguiente etapa."
- If asked "¿Eres IA?": Confirm truthfully
- If candidate requests human contact: Acknowledge and inform that a recruiter will follow up
CONVERSATION STATE: [currentPhase, competenciesCovered, questionsAsked]
KNOWLEDGE BASE: [in-context campaign documents, if any]
```

**Input per turn**: System prompt + session state + last N messages (sliding window of last 10 messages)

**Output**: Conversational response only (plain text to send to candidate)

### 2.2 Evaluator Agent (Pass 2)

A separate prompt evaluates the complete conversation AFTER screening completes.

**Trigger**: When conversation reaches `closing` phase (all competencies covered)

**System Prompt Structure**:
```
ROLE: You are an expert evaluator. Score the following interview transcript.
RUBRIC: [full rubric with competencies, weights, criteria per level 1-5]
INSTRUCTIONS:
- For each competency, assign a score from 1-5 based on the rubric criteria
- For each score, extract a VERBATIM quote from the candidate's responses as evidence
- Provide a brief justification for each score
- Calculate a weighted global score
- Determine recommendation: highly_recommended (≥4.0), recommended (≥3.0), not_recommended (<3.0)
- Identify 2-3 key signals (strengths or concerns)
OUTPUT FORMAT: JSON (structured output)
```

**Input**: Full conversation transcript + rubric

**Output (structured JSON)**:
```json
{
  "globalScore": 3.8,
  "competencyScores": [
    {
      "competencyId": "comm-skills",
      "competencyName": "Comunicación",
      "score": 4,
      "evidence": [
        {
          "quote": "Le expliqué paso a paso lo que iba a hacer...",
          "messageIndex": 7,
          "relevance": "Demuestra comunicación clara y estructurada"
        }
      ],
      "justification": "Candidate demonstrates clear, organized communication..."
    }
  ],
  "recommendation": "recommended",
  "keySignals": [
    "Buena comunicación verbal",
    "Experiencia limitada en resolución de conflictos"
  ]
}
```

### 2.3 Executive Summary Generation

After the evaluator produces scores, the system generates a human-readable executive summary:

**Inputs**: Evaluator JSON output + candidate profile + campaign info

**Summary Structure**:
- Candidate name + campaign + date
- Global score (X.X / 5.0) + recommendation badge
- Per-competency breakdown: score bar + verbatim evidence quote
- Key signals (strengths + areas of concern)
- Full transcript link

---

## 3. Campaign Management Logic

### 3.1 Campaign Lifecycle

```
DRAFT → ACTIVE → INACTIVE → ARCHIVED
  │                  │
  └──────────────────┘ (can reactivate)
```

| Transition | Rule |
|---|---|
| Draft → Active | Must have: name, role description, rubric assigned |
| Active → Inactive | Manual deactivation by operator. No new screenings. Existing sessions continue |
| Inactive → Active | Manual reactivation |
| Active → Archived | Manual. All pending sessions marked as abandoned |
| Archived → * | Cannot reactivate archived campaigns |

### 3.2 Telegram Link Generation

- Format: `https://t.me/{bot_username}?start={campaign_id}`
- The `start` parameter is parsed by grammY to identify the campaign
- Each campaign gets a unique link
- Invalid campaign IDs trigger the redirect flow (Q4)

### 3.3 Invalid/Expired Campaign Handling

When a Telegram message arrives with an unknown or expired campaign:
1. Bot responds: "Este enlace ya no está activo."
2. If campaign has a configured career page URL: "Puedes explorar más oportunidades aquí: [URL]"
3. If no career page configured: "Por favor contacta al reclutador para más información."

---

## 4. HITL Review Logic

### 4.1 Review Queue

**Query**: All candidates where `state = 'pending_review'` for the authenticated tenant

**Filters**:
- Campaign (dropdown)
- Recommendation level (highly_recommended, recommended, not_recommended)
- Score range (min-max slider)
- Date range

**Sorting**: By score (desc), date (desc), recommendation

### 4.2 Review Decision Flow

```
Recruiter opens candidate detail
  → Views: executive summary + per-competency scores + evidence + transcript
  → Clicks "Aprobar" or "Rechazar"
    → IF decision matches AI recommendation:
        Record decision + optional reason
    → IF decision DIFFERS from AI recommendation:
        MANDATORY: Capture disagreement reason (text field)
        Record decision + disagreement flag + reason
  → Candidate state: pending_review → approved/rejected
  → Log audit event
```

### 4.3 Recommendation Thresholds

| Recommendation | Global Score Range |
|---|---|
| Highly Recommended | ≥ 4.0 |
| Recommended | ≥ 3.0 and < 4.0 |
| Not Recommended | < 3.0 |

---

## 5. Tenant Isolation Logic

### 5.1 Tenant Onboarding (MVP)

- Tenants are seeded directly in DynamoDB by an admin
- A tenant record contains: `tenantId`, `name`, `careerPageUrl` (optional), `createdAt`
- Cognito users are created manually with a custom attribute `custom:tenantId`
- The `tenantId` is extracted from the Cognito JWT token on every authenticated request

### 5.2 Data Scoping

- Every DynamoDB query includes `tenantId` as partition key
- API middleware extracts `tenantId` from the authenticated session
- No API endpoint returns data across tenants
- Telegram conversations: `tenantId` is derived from the campaign's tenant

---

## 6. Escalation Logic

### 6.1 Escalation Levels (MVP)

| Level | Trigger | Action |
|---|---|---|
| Level 0 | Normal conversation | No escalation |
| Level 1 | Candidate asks factual question not in knowledge base | Bot: "No tengo esa información." Log question for KB improvement |
| Level 2 | Candidate asks same type of question repeatedly (2+ times) | Bot: "No tengo esa información. El equipo de reclutamiento podrá ayudarte en la siguiente etapa." Log escalation |

### 6.2 Escalation Detection

- Track `escalationLevel` in SessionState
- Increment when bot responds with "No tengo esa información"
- At Level 2: add stronger redirect language
- Log all escalated questions with context for KB improvement
