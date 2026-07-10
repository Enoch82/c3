# NFR Requirements Plan — Unit 1: MVP Core

## Overview
Consolidate and formalize all non-functional requirements for the MVP Core unit. Most NFR decisions were made during Requirements Analysis and Application Design. This stage formalizes them and resolves remaining gaps.

---

## Clarification Questions

### Question 1
What should happen when the OpenAI API is unavailable or returns an error during a screening conversation?

A) **Graceful retry + pause** — Retry once after 3 seconds. If still failing, send candidate: "Estoy teniendo dificultades técnicas. Puedes intentar de nuevo en unos minutos. Tu progreso está guardado." Pause conversation.
B) **Immediate pause** — No retry. Immediately pause and notify candidate with a friendly message. Resume when candidate sends next message (retry at that point).
C) **Queue and retry** — Store the message, retry in background up to 3 times with exponential backoff. If all fail, notify candidate.
D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 2
What DynamoDB capacity mode should be used for the MVP?

A) **On-demand** — Pay-per-request. No capacity planning. Best for unpredictable MVP traffic. Slightly higher per-request cost but zero risk of throttling.
B) **Provisioned with auto-scaling** — Set base capacity with auto-scaling rules. Lower cost at steady traffic. Requires capacity estimation.
C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3
What logging level and retention should be configured for CloudWatch in the MVP?

A) **Minimal** — INFO level only. 7-day retention. Minimal cost.
B) **Standard** — INFO + WARN + ERROR. 30-day retention. Good for debugging.
C) **Verbose** — DEBUG + INFO + WARN + ERROR. 90-day retention. Full traceability but higher cost.
D) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Execution Plan

- [x] **Step 1**: Formalize performance requirements (`nfr-requirements.md`)
- [x] **Step 2**: Formalize availability, reliability, and error handling (`nfr-requirements.md`)
- [x] **Step 3**: Formalize security and compliance requirements (`nfr-requirements.md`)
- [x] **Step 4**: Document tech stack decisions with rationale (`tech-stack-decisions.md`)
