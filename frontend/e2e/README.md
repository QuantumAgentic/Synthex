# E2E Tests - Service Details Page

End-to-end tests for the x402 service details page functionality using Playwright.

## Test Files

### 1. `service-details.spec.ts`
Tests core navigation and page functionality:
- ✅ Navigation from search results to service details
- ✅ Service header display with metadata
- ✅ Service metrics rendering (analytics, performance, reliability)
- ✅ Dynamic form generation from x402 schema
- ✅ Form submission and mock endpoint testing
- ✅ Back navigation to search results
- ✅ Error handling for missing service data
- ✅ Wallet connection UI display
- ✅ Payment amount display from service data

### 2. `response-viewers.spec.ts`
Tests multi-format response handling:
- ✅ JSON response with syntax highlighting
- ✅ JSON schema validation (valid/invalid)
- ✅ Image response with preview and download
- ✅ Video response with HTML5 player
- ✅ Audio response with player controls
- ✅ PDF response with iframe viewer
- ✅ Text response with copy functionality
- ✅ Binary response with hex preview
- ✅ Error response handling

### 3. `schema-validation.spec.ts`
Tests dynamic form generation and validation:
- ✅ All field types (string, number, boolean, enum)
- ✅ Required field validation
- ✅ Default values from schema
- ✅ Min/max constraints on numbers
- ✅ Pattern validation (email, etc.)
- ✅ GET method with query params
- ✅ POST method with body fields
- ✅ Fallback mode for services without schema

## Running Tests

### All tests (headless)
```bash
cd frontend
npm run test:e2e
```

### Interactive UI mode
```bash
npm run test:e2e:ui
```

### Headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug mode (step through)
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test service-details.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should navigate from search"
```

## Test Structure

Each test follows this pattern:

```typescript
test('should do something', async ({ page }) => {
  // 1. Setup: Create mock service data
  const serviceData = { ... };

  // 2. Store in sessionStorage (mimics ResultCard navigation)
  await page.evaluate(([id, data]) => {
    sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
  }, [serviceId, serviceData]);

  // 3. Navigate to service details page
  await page.goto(`/service/${serviceId}`);

  // 4. Interact and assert
  await expect(page.locator('...')).toBeVisible();
});
```

## Mock Data

Tests use realistic mock data matching the structure from `backend/bazaar.json`:

```typescript
{
  resource: 'https://api.example.com/service',
  description: 'Service description',
  network: 'base' | 'solana',
  asset: 'USDC' | 'SOL',
  manifest: {
    accepts: [{
      maxAmountRequired: '1000000000000000000',
      outputSchema: {
        input: { method, bodyFields/queryParams },
        output: { ... }
      },
      // ...
    }],
    metadata: { analytics, performance, reliability, confidence }
  }
}
```

## Coverage

### Components Tested
- ✅ `app/service/[id]/page.tsx` - Main service details page
- ✅ `components/service/ServiceHeader.tsx` - Header display
- ✅ `components/service/ServiceMetrics.tsx` - Metrics display
- ✅ `components/service/EndpointTester.tsx` - Testing interface
- ✅ `components/service/DynamicSchemaForm.tsx` - Form generation
- ✅ `components/service/ResponseViewer.tsx` - Response routing
- ✅ `components/service/viewers/*` - All 7 specialized viewers
- ✅ `components/service/BackButton.tsx` - Navigation
- ✅ `components/wallet/MultiChainConnect.tsx` - Wallet UI

### Utilities Tested
- ✅ `lib/response-handler.ts` - Content-Type detection and parsing
- ✅ `lib/schema-utils.ts` - Input/output validation
- ✅ `lib/x402-client.ts` - Mock endpoint testing
- ✅ `lib/blob-utils.ts` - Download functionality
- ✅ SessionStorage data persistence

## CI/CD Integration

Tests are configured for CI environments:

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,
});
```

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: cd frontend && npm ci

- name: Install Playwright browsers
  run: cd frontend && npx playwright install --with-deps

- name: Run E2E tests
  run: cd frontend && npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: frontend/playwright-report/
```

## Debugging Tips

### 1. Visual debugging with UI mode
```bash
npm run test:e2e:ui
```
- See test execution in real-time
- Time travel through actions
- Inspect DOM snapshots

### 2. Debug specific test
```bash
npx playwright test --debug -g "should display JSON"
```
- Opens Playwright Inspector
- Step through actions
- Inspect selectors

### 3. View test report
```bash
npx playwright show-report
```
- See failed test screenshots
- View traces
- Check console logs

### 4. Check sessionStorage in test
```typescript
const stored = await page.evaluate(() => {
  return sessionStorage.getItem('service-XXX');
});
console.log('Stored data:', stored);
```

### 5. Wait for network requests
```typescript
await page.waitForResponse(response =>
  response.url().includes('/api/') && response.status() === 200
);
```

## Known Limitations

### Mock Mode
Tests use `mockTestEndpoint()` which generates fake transaction hashes. Real blockchain transactions are not tested.

### Wallet Connection
Tests verify wallet UI renders but don't actually connect wallets or sign transactions.

### Backend Integration
Tests mock API responses. Full integration tests with live backend should be separate.

### Static Export
Next.js is configured with `output: 'export'`, so server-side features can't be tested.

## Future Improvements

- [ ] Add visual regression testing (screenshot comparison)
- [ ] Test real wallet connections with test networks
- [ ] Add performance tests (Lighthouse scores)
- [ ] Test accessibility (a11y)
- [ ] Add mobile viewport tests
- [ ] Test keyboard navigation
- [ ] Add load testing for concurrent users
- [ ] Test with real backend endpoints (integration tests)

## Troubleshooting

### Tests timeout
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Selectors not found
Use Playwright Inspector to find correct selectors:
```bash
npx playwright codegen http://localhost:3000
```

### Dev server not starting
Check port 3000 is available:
```bash
lsof -i :3000
```

### Browser not installed
Reinstall Playwright browsers:
```bash
npx playwright install chromium
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Setup](https://playwright.dev/docs/ci)
