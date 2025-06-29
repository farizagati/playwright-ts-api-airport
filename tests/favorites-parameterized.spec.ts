import { test, expect, request as playwrightRequest } from '@playwright/test';

let authToken: string;

// Parameterized Credentials
const credentials={
      email: 'akuntesares01+1@gmail.com',
      password: 'YoNdakTauKokTanyaSaya'
    }

// Parameterized expected airport data
const expectedAirport = {
  id: 2983,
  name: 'John F Kennedy International Airport',
  city: 'New York',
  country: 'United States',
  iata: 'JFK',
  icao: 'KJFK',
  latitude: '40.639801',
  longitude: '-73.7789',
  altitude: 13,
  timezone: 'America/New_York'
};

// Generate a valid token before all tests
test.beforeEach(async () => {
  const requestContext = await playwrightRequest.newContext();
  const response = await requestContext.post('https://airportgap.com/api/tokens', {
    data: credentials
  });

  const body = await response.json();
  authToken = body.token;
  await requestContext.dispose();
});

test.describe.serial('POST and GET and DELETE /favorites with parameterized data', () => {
  test('should create a favorite airport', async ({ request }) => {
    const response = await request.post('/api/favorites', {
      data: {
        airport_id: expectedAirport.iata,
        note: 'Test save favorite'
      },
      headers: {
        Authorization: `Token ${authToken}`
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body).toHaveProperty('data');
    const { data } = body;
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('type', 'favorite');
    expect(data).toHaveProperty('attributes');

    const attributes = data.attributes;
    expect(attributes).toHaveProperty('note', 'Test save favorite');
    expect(attributes.airport).toMatchObject(expectedAirport);
  });

  test('should retrieve the created favorite airport', async ({ request }) => {
    const response = await request.get('/api/favorites', {
      headers: {
        Authorization: `Token ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType.includes('application/json')).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);

    const favoriteItem = body.data.find((favorite: any) => favorite.attributes.airport.iata === expectedAirport.iata);
    expect(favoriteItem).toBeDefined();
    expect(favoriteItem).toMatchObject({
      type: 'favorite',
      attributes: {
        note: 'Test save favorite',
        airport: expectedAirport
      }
    });
  });

  test('should clear all favorite airports', async ({ request }) => {
    const response = await request.delete('/api/favorites/clear_all', {
      headers: {
        Authorization: `Token ${authToken}`,
      }
    });

    expect(response.status()).toBe(204);
    expect(response.statusText()).toBe('No Content');
  });
});
