import { test, expect } from '@playwright/test';

const baseServiceData = {
  resource: 'https://api.example.com/test',
  description: 'Test API for response formats',
  network: 'base',
  asset: 'USDC',
  similarity: 0.95,
  scores: { trust: 0.85, performance: 0.90, final: 0.88 },
  trustMetrics: { hasReputation: true, reputationScore: 0.85, isVerified: true },
  sources: ['x402scan'],
  manifest: {
    accepts: [
      {
        asset: 'USDC',
        description: 'Test API',
        scheme: 'x402',
        network: 'base',
        maxAmountRequired: '1000000',
        maxTimeoutSeconds: 30,
        mimeType: 'application/json',
        payTo: '0x1234567890123456789012345678901234567890',
        resource: 'https://api.example.com/test',
        outputSchema: {
          input: {
            type: 'http',
            method: 'GET'
          },
          output: {
            message: 'string'
          }
        }
      }
    ],
    metadata: {
      paymentAnalytics: { totalTransactions: 100, totalUniqueUsers: 50, averageDailyTransactions: 10 },
      performance: { uptime: 0.99, avgLatencyMs: 150, minLatencyMs: 80, maxLatencyMs: 300, successRate: 0.98 },
      reliability: { apiSuccessRate: 0.98, totalRequests: 100 },
      confidence: { dataQuality: 0.9, sourceReliability: 0.85 }
    }
  }
};

test.describe('Response Viewers', () => {
  test.beforeEach(async ({ page }) => {
    const serviceId = Buffer.from(baseServiceData.resource).toString('base64').replace(/[/+=]/g, '-');

    await page.goto('/search?q=test');
    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, baseServiceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display JSON response with syntax highlighting', async ({ page }) => {
    // Set up route interception
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Success',
          data: { temperature: 22, humidity: 65 }
        })
      });
    });

    // Submit test
    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    // Wait for response
    await page.waitForSelector('text=/Response|Result/', { timeout: 10000 });

    // Verify JSON is displayed - be more flexible with selectors
    await expect(page.locator('text=/message/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Success/i').first()).toBeVisible({ timeout: 10000 });

    // Verify copy button exists
    await expect(page.locator('button:has-text("Copy")').first()).toBeVisible();
  });

  test('should validate JSON response against output schema', async ({ page }) => {
    // Set up route interception
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Valid response' })
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    await page.waitForSelector('text=/Response|Result/', { timeout: 10000 });

    // Verify validation badge (✓ Valid) - use .first() to avoid strict mode
    await expect(page.locator('text="✓ Schema Valid"').first()).toBeVisible();
  });

  test('should show validation errors for invalid JSON schema', async ({ page }) => {
    // Set up route interception
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ wrongField: 'Invalid' })
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    await page.waitForSelector('text=/Response|Result/', { timeout: 10000 });

    // Verify validation error is shown
    await expect(page.locator('text=/Mismatch|Invalid|Error/').first()).toBeVisible();
  });

  test('should display image response with preview and download', async ({ page }) => {
    // Create a simple 1x1 pixel PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');

    // Set up route interception for binary image
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: pngBuffer
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    // Wait for response section
    await page.waitForSelector('text=/Response|Result/', { timeout: 10000 });

    // Verify image is displayed - be more specific to avoid strict mode
    const image = page.locator('img[src^="blob:"]').first();
    await expect(image).toBeVisible({ timeout: 10000 });

    // Verify download button exists
    await expect(page.locator('button:has-text("Download"), a:has-text("Download")').first()).toBeVisible();
  });

  test('should display video response with player', async ({ page }) => {
    // Create fake video data
    const fakeVideoBase64 = 'ZmFrZS12aWRlby1kYXRh'; // base64 of "fake-video-data"
    const videoBuffer = Buffer.from(fakeVideoBase64, 'base64');

    // Set up route interception for video
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: videoBuffer
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    // Wait for response section
    await page.waitForSelector('text=/Response|Result|Video/', { timeout: 10000 });

    // Verify video player is displayed
    const video = page.locator('video[controls]').first();
    await expect(video).toBeVisible({ timeout: 10000 });

    // Verify download link exists
    await expect(page.locator('a:has-text("Download"), button:has-text("Download")').first()).toBeVisible();
  });

  test('should display audio response with player', async ({ page }) => {
    // Create fake audio data
    const fakeAudioBase64 = 'ZmFrZS1hdWRpby1kYXRh'; // base64 of "fake-audio-data"
    const audioBuffer = Buffer.from(fakeAudioBase64, 'base64');

    // Set up route interception for audio
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/mp3',
        body: audioBuffer
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    // Wait for response section
    await page.waitForSelector('text=/Response|Result|Audio/', { timeout: 10000 });

    // Verify audio player is displayed
    const audio = page.locator('audio[controls]').first();
    await expect(audio).toBeVisible({ timeout: 10000 });

    // Verify download link exists
    await expect(page.locator('a:has-text("Download"), button:has-text("Download")').first()).toBeVisible();
  });

  test('should display PDF response with iframe viewer', async ({ page }) => {
    // Create fake PDF data
    const fakePdfBase64 = 'JVBERi0xLjQgZmFrZSBwZGYgZGF0YQ=='; // base64 of "%PDF-1.4 fake pdf data"
    const pdfBuffer = Buffer.from(fakePdfBase64, 'base64');

    // Set up route interception for PDF
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: pdfBuffer
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    // Wait for response section
    await page.waitForSelector('text=/Response|Result|PDF/', { timeout: 10000 });

    // Verify iframe is displayed
    const iframe = page.locator('iframe[src^="blob:"]').first();
    await expect(iframe).toBeVisible({ timeout: 10000 });

    // Verify download button exists
    await expect(page.locator('button:has-text("Download"), a:has-text("Download")').first()).toBeVisible();
  });

  test('should display text response with copy button', async ({ page }) => {
    // Set up route interception
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'This is a plain text response'
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    await page.waitForSelector('text=/This is a plain text/', { timeout: 10000 });

    // Verify text is displayed
    await expect(page.locator('text=This is a plain text response')).toBeVisible();

    // Verify copy button exists
    await expect(page.locator('button:has-text("Copy")')).toBeVisible();
  });

  test('should display binary response with hex preview', async ({ page }) => {
    // Create binary data "Hello"
    const binaryBase64 = 'SGVsbG8='; // base64 of "Hello" (0x48, 0x65, 0x6c, 0x6c, 0x6f)
    const binaryBuffer = Buffer.from(binaryBase64, 'base64');

    // Set up route interception for binary
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/octet-stream',
        body: binaryBuffer
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    await page.waitForSelector('text=/Binary|Hex|octet-stream|Response/', { timeout: 10000 });

    // Verify binary/hex viewer is displayed
    await expect(page.locator('text=/application\\/octet-stream/').first()).toBeVisible();

    // Verify download button exists
    await expect(page.locator('button:has-text("Download"), a:has-text("Download")').first()).toBeVisible();

    // Verify hex preview is shown (hex values or Hex/Preview text)
    const hexPreview = page.locator('text=/48|65|6c/').or(page.locator('text=/Hex|Preview/'));
    await expect(hexPreview.first()).toBeVisible();
  });

  test('should handle error responses gracefully', async ({ page }) => {
    // Set up route interception for error response
    await page.route('**/*api.example.com*/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await testButton.click();

    await page.waitForSelector('text=/Error|Failed/', { timeout: 10000 });

    // Verify error message is displayed - use .first() to avoid strict mode
    await expect(page.locator('text="500 Error"').first()).toBeVisible();
  });
});
