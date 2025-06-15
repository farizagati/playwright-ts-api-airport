import { test, expect } from '@playwright/test';

test.describe('POST /tokens', () => {
  test('should return a token when valid credentials are provided', async ({ request }) => {
    const response = await request.post('/api/tokens', {
      data: {
        email: 'test@airportgap.com',
        password: 'airportgappassword'
      }
    });

    // Validate HTTP status
    expect(response.status(), 'expected 200 OK').toBe(200);

    // Validate response body
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
    
  });
});
