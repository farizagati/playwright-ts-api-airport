import { test, expect } from '@playwright/test';

test.describe('GET /airports', () => {
  test('should return a list of airports with expected structure', async ({ request }) => {
    const response = await request.get('/airports');

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body.airports)).toBeTruthy;
    expect(body.airports.length).toBeGreaterThan(0);

    for (const airport of body.airports) {
      expect(airport).toHaveProperty('id');
      expect(airport).toHaveProperty('name');
      expect(airport).toHaveProperty('city');
      expect(airport).toHaveProperty('country');
      expect(airport).toHaveProperty('iata');
      expect(airport).toHaveProperty('latitude');
      expect(airport).toHaveProperty('longitude');
    }

  });

});
