# Performance Test Instructions — EntreVista AI MVP Core

## Performance Requirements
| Metric | Target |
|---|---|
| Bot response latency (with LLM) | < 10 seconds |
| Dashboard page load | < 3 seconds |
| API endpoint response (CRUD) | < 500ms |
| Executive summary generation | < 30 seconds |
| Concurrent Telegram conversations | Up to 50 |

## MVP Performance Testing (Manual)

Given the MVP scale (100-500 candidates, low traffic), formal load testing tools are not required. Instead, validate performance through manual observation:

### 1. Bot Response Latency
- Start a real screening conversation via Telegram
- Measure time between message sent and bot response received
- **Target**: < 10 seconds per turn
- **Primary bottleneck**: OpenAI API latency (3-8 seconds typical)

### 2. Dashboard Load Time
- Open browser developer tools (Network tab)
- Navigate to /campaigns, /review pages
- Measure Time to First Contentful Paint
- **Target**: < 3 seconds

### 3. API Response Time
- Use `curl` with timing:
```bash
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://{ALB_URL}/api/health
curl -w "Time: %{time_total}s\n" -o /dev/null -s -H "Authorization: Bearer {TOKEN}" https://{ALB_URL}/api/campaigns
```
- **Target**: < 500ms for CRUD operations

### 4. DynamoDB Latency
- Monitor via CloudWatch DynamoDB metrics:
  - `SuccessfulRequestLatency` — should be < 50ms
  - `ThrottledRequests` — should be 0 (on-demand capacity)

## Future Load Testing (Post-MVP)
When scaling beyond 500 candidates, implement formal load tests using:
- **k6** or **Artillery** for API load testing
- Simulate 50 concurrent Telegram conversations
- Monitor ECS auto-scaling behavior under load
