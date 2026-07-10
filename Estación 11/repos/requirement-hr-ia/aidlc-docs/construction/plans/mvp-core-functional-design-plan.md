# Functional Design Plan — Unit 1: MVP Core

## Overview
Detail the business logic, domain models, and business rules for the MVP Core unit. This covers the complete screening flow: campaign setup → Telegram onboarding → conversational screening → evaluation → dashboard HITL review.

---

## Clarification Questions

### Question 1
How should the AI agent score candidate responses against rubric competencies?

A) **LLM-as-judge with structured output** — After each relevant response, send the response + rubric criteria to OpenAI with a structured output schema (JSON). The LLM returns a score (1-5), evidence quote, and justification. Single-pass evaluation.
B) **Dual-pass evaluation** — First pass: the screening agent conducts the conversation. Second pass: a separate "evaluator" prompt scores the response against the rubric after the conversation. More accurate but higher latency/cost.
C) **Inline scoring** — The same system prompt that drives the conversation also instructs the agent to internally track scores and output them in a structured JSON block alongside its conversational response. Single LLM call per turn.
D) Other (please describe after [Answer]: tag below)

[Answer]:B

### Question 2
How should the conversation flow be controlled in terms of follow-up questions (repreguntas)?

A) **Fixed limit** — Maximum 1 follow-up per competency question. After the follow-up, move to the next competency regardless of response quality.
B) **Adaptive with cap** — The agent decides if a follow-up is needed based on response quality, with a maximum of 2 follow-ups per competency. Moves on when satisfied or cap reached.
C) **Fully adaptive** — The agent decides both whether to follow up and when to move on, guided by the rubric but with no hard cap. Risk of overly long sessions.
D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3
How should tenant (organization) onboarding work for the MVP?

A) **Seed via database** — Tenants are created directly in DynamoDB by an admin (no self-service). Cognito users are manually associated with a tenant ID.
B) **Simple signup flow** — A basic registration page where the organization signs up, which creates the Cognito user + tenant record. No approval process.
C) **Invite-only** — An admin creates the tenant and sends an invite link. The invited user completes Cognito registration via the link.
D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4
What should happen when the Telegram webhook receives a message from an unknown campaign link (invalid or expired)?

A) **Silent ignore** — Bot does not respond. No error message.
B) **Friendly error** — Bot responds with a message like "Este enlace no es válido o la campaña ha finalizado. Por favor contacta al reclutador."
C) **Redirect** — Bot responds with a generic message and a link to the company's career page (if configured).
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Execution Plan

- [x] **Step 1**: Define conversation state machine and phase transitions (`business-logic-model.md`)
- [x] **Step 2**: Define domain entities with all fields, types, and relationships (`domain-entities.md`)
- [x] **Step 3**: Define business rules, validation logic, and constraints (`business-rules.md`)
- [x] **Step 4**: Define frontend component hierarchy and UI flows (`frontend-components.md`)
