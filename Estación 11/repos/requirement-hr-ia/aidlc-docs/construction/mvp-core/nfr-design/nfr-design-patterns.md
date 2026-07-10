# NFR Design Patterns — Unit 1: MVP Core

## Pattern 1: Tenant Isolation Middleware

**NFR**: SEC-02, SEC-03 | **Category**: Security

**Purpose**: Ensure every API request and data operation is scoped to the authenticated user's tenant.

### Implementation

```typescript
// infrastructure/auth/tenantMiddleware.ts

// 1. Extract tenantId from Cognito JWT (custom:tenantId claim)
// 2. Attach to request context
// 3. All downstream repository calls use this tenantId

type TenantContext = {
  tenantId: string;
  userId: string;
  email: string;
};

// Next.js middleware pattern:
// - Runs on every (dashboard) route and API route
// - Validates JWT via NextAuth session
// - Extracts tenantId from session
// - Rejects requests without valid tenantId (401)
```

### Data Flow
```
Request → NextAuth Session Check → Extract tenantId → Attach to context → Repository uses tenantId as PK
```

### Telegram Tenant Resolution
```
Telegram message → Extract campaignId from /start param → Look up campaign → Get tenantId from campaign
```

**Key Rule**: No repository method can be called without `tenantId`. This is enforced via TypeScript (required parameter).

---

## Pattern 2: Graceful Retry with Pause (OpenAI)

**NFR**: AVAIL-04, PERF-01 | **Category**: Resilience

**Purpose**: Handle OpenAI API failures without losing candidate progress.

### Implementation

```typescript
// infrastructure/openai/resilientOpenAIClient.ts

// Retry strategy:
// 1. First call to OpenAI
// 2. If fails (timeout, 5xx, rate limit): wait 3 seconds
// 3. Retry once
// 4. If retry fails:
//    a. Log error with correlationId
//    b. Return failure result (not throw)
//    c. Caller (ScreeningOrchestrator) handles by:
//       - Sending pause message to candidate
//       - Setting conversation state to 'paused'
//       - Storing the candidate's message for reprocessing on resume

// Errors that trigger retry:
// - HTTP 429 (rate limit)
// - HTTP 500, 502, 503 (server errors)
// - Network timeout (>15s)

// Errors that do NOT retry:
// - HTTP 400 (bad request — our bug)
// - HTTP 401 (auth — misconfiguration)
```

### State Diagram
```
Normal → OpenAI Call → Success → Respond to candidate
                    → Fail → Wait 3s → Retry → Success → Respond
                                             → Fail → Pause conversation
                                                       → Notify candidate
                                                       → Log error
```

---

## Pattern 3: Structured Logging

**NFR**: OBS-01 to OBS-05 | **Category**: Observability

**Purpose**: Consistent JSON structured logs across all modules, compatible with CloudWatch.

### Implementation

```typescript
// infrastructure/logging/logger.ts

// Logger interface:
// - info(message, context)
// - warn(message, context)
// - error(message, context, error)

// Every log entry includes:
// {
//   timestamp: ISO 8601,
//   level: 'INFO' | 'WARN' | 'ERROR',
//   correlationId: string,    // Per-request unique ID
//   tenantId?: string,        // If available
//   service: string,          // Module name
//   message: string,
//   context: Record<string, unknown>,
//   error?: { message, stack }  // Only for ERROR level
// }

// Correlation ID propagation:
// - Generated at API route entry / Telegram webhook entry
// - Passed through all service calls via function parameters
// - Included in all log entries for request tracing
```

### Key Logging Points

| Event | Level | Service | Context |
|---|---|---|---|
| Screening started | INFO | conversation | campaignId, candidateId |
| Screening completed | INFO | conversation | conversationId, duration |
| OpenAI call | INFO | openai | model, tokenUsage, latency |
| OpenAI error | ERROR | openai | error, attempt, correlationId |
| Evaluation generated | INFO | evaluation | conversationId, globalScore |
| Review decision | INFO | candidate | candidateId, decision, disagreesWithAI |
| Escalation triggered | WARN | conversation | conversationId, escalationCount, question |
| Auth failure | WARN | auth | reason, ip |
| Unhandled error | ERROR | (any) | error, stack, correlationId |

---

## Pattern 4: Cognito JWT Authentication

**NFR**: SEC-01, SEC-02 | **Category**: Security

**Purpose**: Authenticate dashboard users via Cognito and extract tenant context.

### Implementation

```typescript
// infrastructure/auth/authOptions.ts (NextAuth.js config)

// Provider: Cognito
// - Client ID + Client Secret from environment variables
// - Issuer: Cognito User Pool URL
// - Profile mapping:
//   - id → Cognito sub
//   - email → Cognito email
//   - tenantId → custom:tenantId claim

// Session strategy: JWT (stateless)
// - Token contains: userId, email, tenantId
// - Token validated on every request via NextAuth middleware

// Route protection:
// - All (dashboard) routes: require authenticated session
// - All /api/* routes (except /api/telegram and /api/health): require authenticated session
// - /api/telegram/webhook: validated via Telegram bot token (not Cognito)
```

### Auth Flow
```
User → Login Page → Cognito Hosted UI → Callback → NextAuth Session → Dashboard
```

---

## Pattern 5: Repository Pattern with Tenant Scoping

**NFR**: SEC-03, MAINT-01 | **Category**: Security + Maintainability

**Purpose**: Abstract DynamoDB access behind repository interfaces, ensuring tenant isolation.

### Implementation

```typescript
// Pattern: Every repository method requires tenantId

// Domain layer defines interfaces (ports):
// domain/conversation/ports/ConversationRepository.ts
interface ConversationRepository {
  save(tenantId: string, conversation: Conversation): Promise<void>;
  findById(tenantId: string, conversationId: string): Promise<Conversation | null>;
  // ... all methods require tenantId
}

// Infrastructure layer implements (adapters):
// infrastructure/dynamodb/repositories/DynamoConversationRepository.ts
// - Uses tenantId as partition key in all operations
// - No method allows querying without tenantId
// - Batch operations always scoped by tenantId
```

### DynamoDB Access Pattern
```
Every operation:
  PK = tenantId
  SK = entityId (or composite)

No scan operations — always query by partition key
```

---

## Pattern 6: Request Validation with Zod

**NFR**: MAINT-02 | **Category**: Maintainability

**Purpose**: Validate all API inputs at the boundary using Zod schemas.

### Implementation

```typescript
// shared/validators/

// Every API route validates input:
// 1. Parse request body with Zod schema
// 2. If invalid: return 400 with validation errors
// 3. If valid: pass typed data to use case

// Example:
// const CreateCampaignSchema = z.object({
//   name: z.string().min(1).max(200),
//   roleDescription: z.string().min(1).max(2000),
//   rubricTemplate: z.enum(['bpo', 'tech']),
//   basicRequirements: z.array(BasicRequirementSchema).optional(),
// });

// Benefits:
// - Type safety (Zod infers TypeScript types)
// - Validation errors are structured and user-friendly
// - Single source of truth for input constraints
```

---

## Pattern 7: Health Check

**NFR**: OBS-06, AVAIL-01 | **Category**: Availability

**Purpose**: ALB health check endpoint to detect unhealthy ECS tasks.

### Implementation

```typescript
// app/api/health/route.ts

// GET /api/health
// 1. Check DynamoDB connectivity (simple GetItem on a known key)
// 2. Return 200 { status: 'healthy', timestamp, version }
// 3. If DynamoDB unreachable: return 503 { status: 'unhealthy', error }

// ALB health check configuration:
// - Path: /api/health
// - Interval: 30 seconds
// - Healthy threshold: 2
// - Unhealthy threshold: 3
// - Timeout: 5 seconds
```

---

## Pattern 8: Error Boundary (API Routes)

**NFR**: AVAIL-02, OBS-01 | **Category**: Reliability

**Purpose**: Global error handling for API routes to prevent unhandled exceptions.

### Implementation

```typescript
// shared/utils/apiHandler.ts

// Wrapper for all API route handlers:
// 1. Wraps handler in try/catch
// 2. On error:
//    a. Log error with correlationId and stack trace
//    b. Return 500 { error: 'Internal server error' } (no stack in response)
// 3. On validation error: return 400 with Zod errors
// 4. On auth error: return 401
// 5. On not found: return 404

// Usage in route:
// export const POST = apiHandler(async (req, ctx) => {
//   // ... handler logic
// });
```
