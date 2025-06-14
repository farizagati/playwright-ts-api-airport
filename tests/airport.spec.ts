import { test, expect } from '@playwright/test';

 test.describe('GET /airports', () => {
  test('Return a list of airports with expected structure', async ({ request }) => {

    const response = await request.get('/api/airports', {

    });

    // Ensure status and content type
    expect(response.status(), 'expected 200 status').toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType.includes('application/json'), 'expected JSON response').toBeTruthy();

    // Parse JSON
    const body = await response.json();

    // Validate top-level structure
    expect(Array.isArray(body.data), 'data should be an array').toBeTruthy();
    expect(body.data.length, 'array should not be empty').toBeGreaterThan(0);

    // Validate each resource
    for (const resource of body.data) {
      // resource shape
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('type', 'airport');
      expect(resource).toHaveProperty('attributes');

      const attrs = resource.attributes;
      expect(attrs).toHaveProperty('name');
      expect(attrs).toHaveProperty('city');
      expect(attrs).toHaveProperty('country');
      expect(attrs).toHaveProperty('iata');
      expect(attrs).toHaveProperty('icao');
      expect(attrs).toHaveProperty('latitude');
      expect(attrs).toHaveProperty('longitude');
      expect(attrs).toHaveProperty('altitude');
      expect(attrs).toHaveProperty('timezone');
    }
  });
});
