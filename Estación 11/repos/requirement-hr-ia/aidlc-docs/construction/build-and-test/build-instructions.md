# Build Instructions — EntreVista AI MVP Core

## Prerequisites
- **Node.js**: v20 LTS
- **npm**: v10+
- **Docker**: v24+ (for container build)
- **Terraform**: v1.5+ (for infrastructure)
- **AWS CLI**: v2 (for deployment)

## Environment Variables
Copy `.env.example` to `.env.local` and configure:
```bash
cd webapp
cp .env.example .env.local
# Edit .env.local with your values
```

## Build Steps

### 1. Install Dependencies
```bash
cd webapp
npm ci
```

### 2. Run Type Check
```bash
npx tsc --noEmit
```
**Expected**: No errors.

### 3. Run Unit Tests
```bash
npx vitest run
```
**Expected**: 10 files, 98 tests, all passed.

### 4. Build Application
```bash
npm run build
```
**Expected**: "Compiled successfully", 18 routes (10 static + 8 dynamic).

### 5. Build Docker Image
```bash
docker build -t entrevista-ai:latest .
```
**Expected**: Multi-stage build completes, image < 200MB.

### 6. Run Locally (Optional)
```bash
docker-compose up
```
App available at http://localhost:3000. DynamoDB Local at http://localhost:8000.

## Build Artifacts
| Artifact | Location |
|---|---|
| Next.js standalone output | `.next/standalone/` |
| Static files | `.next/static/` |
| Docker image | `entrevista-ai:latest` |

## Troubleshooting

### Build fails with "Module not found"
**Cause**: Missing dependency or incorrect import path.
**Solution**: Run `npm ci` and verify `@/` path alias resolves to `src/`.

### Docker build fails at "npm run build"
**Cause**: Environment variables referenced at build time.
**Solution**: Ensure Telegram bot and OpenAI use lazy imports (already implemented).
