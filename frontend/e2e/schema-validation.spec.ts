import { test, expect } from '@playwright/test';

test.describe('Schema Validation and Dynamic Forms', () => {
  test('should generate form with all field types', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/complex',
      description: 'API with complex schema',
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
            description: 'Complex API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/complex',
            outputSchema: {
              input: {
                type: 'http',
                method: 'POST',
                bodyFields: {
                  name: {
                    type: 'string',
                    required: true,
                    description: 'User name',
                    minLength: 2,
                    maxLength: 50
                  },
                  age: {
                    type: 'number',
                    required: false,
                    description: 'User age',
                    minimum: 0,
                    maximum: 150
                  },
                  active: {
                    type: 'boolean',
                    default: true,
                    description: 'Active status'
                  },
                  role: {
                    type: 'string',
                    enum: ['admin', 'user', 'guest'],
                    default: 'user',
                    description: 'User role'
                  },
                  email: {
                    type: 'string',
                    required: true,
                    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
                    description: 'Email address'
                  }
                }
              },
              output: {
                id: 'string',
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    // Verify string input (name)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('type', 'text');
    await expect(nameInput).toHaveAttribute('required');

    // Verify number input (age)
    const ageInput = page.locator('input[name="age"]');
    await expect(ageInput).toBeVisible();
    await expect(ageInput).toHaveAttribute('type', 'number');

    // Verify boolean input (checkbox)
    const activeInput = page.locator('input[name="active"]');
    await expect(activeInput).toBeVisible();
    await expect(activeInput).toHaveAttribute('type', 'checkbox');

    // Verify enum select (role)
    const roleSelect = page.locator('select[name="role"]');
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect).toContainText('admin');
    await expect(roleSelect).toContainText('user');
    await expect(roleSelect).toContainText('guest');

    // Verify pattern input (email)
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should validate required fields before submission', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/validate',
      description: 'API with validation',
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
            description: 'Validation API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/validate',
            outputSchema: {
              input: {
                type: 'http',
                method: 'POST',
                bodyFields: {
                  username: {
                    type: 'string',
                    required: true,
                    description: 'Username'
                  }
                }
              },
              output: {
                success: 'boolean'
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    // Wait for form to be visible
    await page.waitForSelector('input[name="username"]', { timeout: 15000 });

    // Wait for page to fully render
    await page.waitForTimeout(1000);

    // Try to submit without filling required field
    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test"), button[type="submit"]').first();
    await testButton.waitFor({ state: 'visible', timeout: 15000 });
    await testButton.click();

    // Browser should show HTML5 validation error
    const usernameInput = page.locator('input[name="username"]');
    const validationMessage = await usernameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should apply default values from schema', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/defaults',
      description: 'API with defaults',
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
            description: 'Defaults API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/defaults',
            outputSchema: {
              input: {
                type: 'http',
                method: 'POST',
                bodyFields: {
                  units: {
                    type: 'string',
                    enum: ['metric', 'imperial'],
                    default: 'metric'
                  },
                  limit: {
                    type: 'number',
                    default: 10
                  }
                }
              },
              output: {
                data: 'array'
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    // Verify default values are pre-filled
    const unitsSelect = page.locator('select[name="units"]');
    await expect(unitsSelect).toHaveValue('metric');

    const limitInput = page.locator('input[name="limit"]');
    await expect(limitInput).toHaveValue('10');
  });

  test('should handle services without schema (fallback mode)', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/no-schema',
      description: 'API without schema',
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
            description: 'No schema API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/no-schema'
            // No outputSchema defined
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    // Verify fallback UI is shown - no input parameters message
    await expect(page.locator('text="This endpoint doesn\'t require input parameters"')).toBeVisible();

    // Verify Test Endpoint button is still available
    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test")');
    await expect(testButton).toBeVisible();
  });

  test('should respect min/max constraints on number fields', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/constraints',
      description: 'API with constraints',
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
            description: 'Constraints API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/constraints',
            outputSchema: {
              input: {
                type: 'http',
                method: 'POST',
                bodyFields: {
                  quantity: {
                    type: 'number',
                    required: true,
                    minimum: 1,
                    maximum: 100
                  }
                }
              },
              output: {
                result: 'number'
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    const quantityInput = page.locator('input[name="quantity"]');
    await quantityInput.waitFor({ state: 'visible', timeout: 15000 });

    // Verify min/max attributes
    await expect(quantityInput).toHaveAttribute('min', '1');
    await expect(quantityInput).toHaveAttribute('max', '100');

    // Try to enter invalid value
    await quantityInput.fill('150');

    // Wait for form to be ready
    await page.waitForTimeout(1000);

    const testButton = page.locator('button:has-text("Test Endpoint"), button:has-text("Test"), button[type="submit"]').first();
    await testButton.waitFor({ state: 'visible', timeout: 15000 });
    await testButton.click();

    // Browser should show validation error
    const validationMessage = await quantityInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should handle GET method with query params', async ({ page }) => {
    const serviceData = {
      resource: 'https://api.example.com/get-test',
      description: 'GET API',
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
            description: 'GET API',
            scheme: 'x402',
            network: 'base',
            maxAmountRequired: '1000000',
            maxTimeoutSeconds: 30,
            mimeType: 'application/json',
            payTo: '0x1234567890123456789012345678901234567890',
            resource: 'https://api.example.com/get-test',
            outputSchema: {
              input: {
                type: 'http',
                method: 'GET',
                queryParams: {
                  search: {
                    type: 'string',
                    required: true,
                    description: 'Search query'
                  },
                  limit: {
                    type: 'number',
                    default: 10
                  }
                }
              },
              output: {
                results: 'array'
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

    const serviceId = Buffer.from(serviceData.resource).toString('base64').replace(/[/+=]/g, '-');
    await page.goto('/search?q=test');

    await page.evaluate(([id, data]) => {
      sessionStorage.setItem(`service-${id}`, JSON.stringify(data));
    }, [serviceId, serviceData]);

    await page.goto(`/service/${serviceId}`);
    await page.waitForLoadState('networkidle');

    // Verify form fields for query params
    const searchInput = page.locator('input[name="search"]');
    await expect(searchInput).toBeVisible();

    const limitInput = page.locator('input[name="limit"]');
    await expect(limitInput).toBeVisible();
    await expect(limitInput).toHaveValue('10');

    // Verify method indicator (GET)
    const methodCode = page.locator('code:has-text("GET")').first();
    await expect(methodCode).toBeVisible();
  });
});
