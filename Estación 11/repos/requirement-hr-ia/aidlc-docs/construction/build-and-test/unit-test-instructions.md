# Unit Test Execution — EntreVista AI MVP Core

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
cd webapp
npx vitest run
```

### 2. Execute with Verbose Output
```bash
npx vitest run --reporter=verbose
```

### 3. Execute with Coverage
```bash
npx vitest run --coverage
```

## Expected Results
- **Total Files**: 10
- **Total Tests**: 98
- **Expected**: All passed (0 failures)
- **Duration**: < 500ms

## Test Files Inventory

| File | Tests | Layer | Stories |
|---|---|---|---|
| `domain/conversation/rules/conversation-rules.test.ts` | 22 | Domain | US-1.1, US-1.2, US-1.4, US-1.5, US-1.6, US-1.7 |
| `domain/evaluation/rules/evaluation-rules.test.ts` | 23 | Domain | US-2.1, US-2.2, US-2.3 |
| `domain/campaign/rules/campaign-rules.test.ts` | 11 | Domain | US-3.1 |
| `domain/candidate/rules/candidate-rules.test.ts` | 8 | Domain | US-3.3, US-5.1 |
| `domain/compliance/rules/compliance-rules.test.ts` | 5 | Domain | US-4.1 |
| `application/conversation/process-message.test.ts` | 9 | Application | US-1.1, US-1.2, US-1.4, US-1.5, US-1.6, US-1.8 |
| `application/conversation/process-message-verification.test.ts` | 3 | Application | US-1.3 |
| `application/campaign/create-campaign.test.ts` | 5 | Application | US-3.1 |
| `application/evaluation/evaluate-conversation.test.ts` | 6 | Application | US-2.3 |
| `application/candidate/review-candidate.test.ts` | 5 | Application | US-3.3 |

## Key Test Scenarios

### Conversation Flow (US-1.1 to US-1.8)
- Onboarding → consent phase transition
- Affirmative/negative/ambiguous consent handling
- Verification → screening transition with OpenAI call
- AI identity question detection and response
- Salary/benefits escalation (Level 1 and Level 2)
- Human contact request handling
- Inactivity detection (5min, 24h, 48h, 72h abandon)
- Screening completion detection

### Evaluation (US-2.1 to US-2.3)
- Weighted global score calculation
- Recommendation thresholds (highly_recommended ≥4, recommended ≥3, not_recommended <3)
- Evidence validation (every score has ≥1 quote)
- Rubric template validation (BPO + Tech: weights sum to 1.0, 3-5 competencies, criteria for all levels)
- Dual-pass evaluation: conversation → evaluator → save + state update

### HITL Review (US-3.1, US-3.3)
- Campaign creation with BPO/Tech templates and Telegram link
- Candidate approval (aligned with AI)
- Candidate rejection with mandatory disagreement reason
- Candidate not found / wrong state errors

### Compliance (US-4.1, US-5.1)
- Audit event creation with unique IDs, timestamps, all 9 event types
- Candidate state transition validation (valid + invalid)
