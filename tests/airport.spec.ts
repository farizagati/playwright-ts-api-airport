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

  test('should return details for airport CGK with correct values', async ({ request }) => {
    const response = await request.get('/api/airports/CGK');

    // Status and JSON checks
    expect(response.status(), 'expected 200 status').toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType.includes('application/json'), 'expected JSON response').toBeTruthy();

    // Parse JSON body
    const body = await response.json();
    const resource = body.data;

    // Top-level resource checks
    expect(resource).toHaveProperty('id', 'CGK');
    expect(resource).toHaveProperty('type', 'airport');
    expect(resource).toHaveProperty('attributes');

    // Attributes and expected values
    const attrs = resource.attributes;
    expect(attrs).toHaveProperty('name', 'Soekarno-Hatta International Airport');
    expect(attrs).toHaveProperty('city', 'Jakarta');
    expect(attrs).toHaveProperty('country', 'Indonesia');
    expect(attrs).toHaveProperty('iata', 'CGK');
    expect(attrs).toHaveProperty('icao', 'WIII');
    expect(attrs).toHaveProperty('latitude', '-6.12557');
    expect(attrs).toHaveProperty('longitude', '106.655998');
    expect(attrs).toHaveProperty('altitude', 34);
    expect(attrs).toHaveProperty('timezone', 'Asia/Jakarta');
  });

  test('should return correct distance between CGK and DPS with expected values', async ({ request }) => {
    const response = await request.post('/api/airports/distance', {
      data: {
        from: 'CGK',
        to: 'DPS'
      }
    });

    // Status validation
    expect(response.status(), 'expected 200 status').toBe(200);

    const body = await response.json();
    const resource = body.data;
 
    // Top-level resource structure validation
    expect(resource).toHaveProperty('id', 'CGK-DPS');
    expect(resource).toHaveProperty('type', 'airport_distance');
    expect(resource).toHaveProperty('attributes');

    const attrs = resource.attributes;

    // From airport details
    const fromAirport = attrs.from_airport;
    expect(fromAirport).toMatchObject({
      id: 2501,
      name: 'Soekarno-Hatta International Airport',
      city: 'Jakarta',
      country: 'Indonesia',
      iata: 'CGK',
      icao: 'WIII',
      latitude: '-6.12557',
      longitude: '106.655998',
      altitude: 34,
      timezone: 'Asia/Jakarta'
    });

    // To airport details
    const toAirport = attrs.to_airport;
    expect(toAirport).toMatchObject({
      id: 3115,
      name: 'Ngurah Rai (Bali) International Airport',
      city: 'Denpasar',
      country: 'Indonesia',
      iata: 'DPS',
      icao: 'WADD',
      latitude: '-8.74817',
      longitude: '115.167',
      altitude: 14,
      timezone: 'Asia/Makassar'
    });

    // Distance values
    expect(attrs.kilometers).toBeCloseTo(982.5905287866152, 6);
    expect(attrs.miles).toBeCloseTo(610.1284149866348, 6);
    expect(attrs.nautical_miles).toBeCloseTo(530.1868428254182, 6);
    
  });

  
});
