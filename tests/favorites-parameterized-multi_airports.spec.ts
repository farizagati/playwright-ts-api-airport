import { test, expect, request as playwrightRequest } from '@playwright/test';

let authToken: string;

// Parameterized Credentials
const credentials={
      email: 'akuntesares01+1@gmail.com',
      password: 'YoNdakTauKokTanyaSaya'
    }

// Array of airports to test
const airports = [
  {
    id: 'CGK',
    data: {
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
    }
  },
  {
    id: 'DPS',
    data: {
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
    }
  }
];

// Generate token once before all tests
test.beforeAll(async () => {
  const context = await playwrightRequest.newContext();
  const response = await context.post('https://airportgap.com/api/tokens', {
    data: credentials
  });
  const body = await response.json();
  authToken = body.token;
  await context.dispose();
});

test.describe.serial('POST, GET, DELETE Favorites (Multiple Airports)', () => {
  for (const airport of airports) {
    test(`should create favorite for airport ${airport.id}`, async ({ request }) => {
      const createFavoriteResponse = await request.post('/api/favorites', {
        data: {
          airport_id: airport.id,
          note: 'Test save favorite'
        },
        headers: {
          Authorization: `Token ${authToken}`
        }
      });

      expect(createFavoriteResponse.status()).toBe(201);
      const body = await createFavoriteResponse.json();

      expect(body).toHaveProperty('data');
      const fav = body.data;
      expect(fav).toHaveProperty('type', 'favorite');
      expect(fav.attributes).toHaveProperty('note', 'Test save favorite');
      expect(fav.attributes.airport).toMatchObject(airport.data);
    });
  }

  test('should retrieve all favorites including multiple entries', async ({ request }) => {
    const response = await request.get('/api/favorites', {
      headers: {
        Authorization: `Token ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const favoriteAirports = body.data.map((fav: any) => fav.attributes.airport.iata);

    for (const airport of airports) {
      expect(favoriteAirports).toContain(airport.id);
    }
  });

  test('should clear all favorite airports', async ({ request }) => {
    const response = await request.delete('/api/favorites/clear_all', {
      headers: {
        Authorization: `Token ${authToken}`
      }
    });

    expect(response.status()).toBe(204);
  });
});
