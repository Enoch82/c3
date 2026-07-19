# Integration Test Instructions — EntreVista AI MVP Core

## Purpose
Test interactions between application layers and external services (DynamoDB, OpenAI, Telegram) to ensure the end-to-end screening flow works correctly.

## Setup Integration Test Environment

### 1. Start Local Services
```bash
cd webapp
docker-compose up -d dynamodb-local
```

### 2. Create DynamoDB Tables (Local)
```bash
# Script to create tables in DynamoDB Local
aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name entrevista-dev-conversations \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=telegramUserIdCampaignId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=conversationId,KeyType=RANGE \
  --global-secondary-indexes '[{"IndexName":"ByTelegram","KeySchema":[{"AttributeName":"telegramUserIdCampaignId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST

# Repeat for: campaigns, candidates, evaluations, audit-events, consent
```

### 3. Configure Environment
```bash
export DYNAMODB_ENDPOINT=http://localhost:8000
export DYNAMODB_TABLE_PREFIX=entrevista-dev
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
```

## Test Scenarios

### Scenario 1: Campaign CRUD Flow
- **Description**: Create, read, update, and activate a campaign
- **Steps**:
  1. POST /api/campaigns — create with BPO template
  2. GET /api/campaigns — verify in list
  3. PUT /api/campaigns/:id — update status to 'active'
  4. GET /api/campaigns/:id — verify active status + Telegram link
- **Expected**: Campaign created with rubric, Telegram link generated, status transitions work

### Scenario 2: End-to-End Screening Flow (Manual)
- **Description**: Complete screening from Telegram to recruiter review
- **Steps**:
  1. Create active campaign
  2. Simulate Telegram /start with campaign ID
  3. Process consent message ("Sí")
  4. Process verification response
  5. Process competency responses (3-5 questions with follow-ups)
  6. Verify screening completes and evaluation generates
  7. GET /api/candidates — verify in review queue
  8. POST /api/candidates/:id/review — approve
- **Expected**: Full flow completes, evaluation has scores + evidence, candidate moves to approved

### Scenario 3: Tenant Isolation
- **Description**: Verify data isolation between tenants
- **Steps**:
  1. Create campaign as tenant-A
  2. Create campaign as tenant-B
  3. GET /api/campaigns as tenant-A — should not see tenant-B campaigns
- **Expected**: Zero cross-tenant data leakage

### Scenario 4: Anti-Hallucination
- **Description**: Verify bot handles out-of-scope questions correctly
- **Steps**:
  1. Start screening
  2. Send salary question
  3. Verify "No tengo esa información" response
  4. Send salary question again
  5. Verify Level 2 escalation response
- **Expected**: No fabricated information, escalation counter increments

## Cleanup
```bash
docker-compose down
```
