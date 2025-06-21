import { test, expect, request as playwrightRequest } from '@playwright/test';

let authToken: string;

// Obtain an API token once before all tests
test.beforeAll(async () => {
  const requestContext = await playwrightRequest.newContext();
  const tokenResponse = await requestContext.post('https://airportgap.com/api/tokens', {
    data: { 
        email: 'test@airportgap.com', // YOUR EMAIL HERE
        password: 'airportgappassword' // YOUR PASSWORD HERE
    },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  });
  expect(tokenResponse.status()).toBe(200);
  const tokenResponseBody = await tokenResponse.json();
  expect(tokenResponseBody).toHaveProperty('token');
  authToken = tokenResponseBody.token;
  //cleanup requestContext after no longer needed
  await requestContext.dispose();
});

test.describe.serial('API Chaining Flow', () => {
  test('should GET airport, add favorite, edit note, GET favorite, DELETE the favorite, and verify the favorite is deleted', async ({ request }) => {
    // 1. GET Airport list
    const airportListResponse = await request.get('/api/airports');
    expect(airportListResponse.status()).toBe(200);
    const airportListBody = await airportListResponse.json();
    expect(Array.isArray(airportListBody.data)).toBeTruthy();
    //get the data array 0
    const airportId = airportListBody.data[0].id;
    expect(airportId).toBe('GKA');

    // 2. Add Airport to Favorite
    const createFavoriteResponse = await request.post('/api/favorites', {
      data: { 
        airport_id: airportId, 
        note: 'Testing Note 1' 
      },
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json'
      }
    });
    expect(createFavoriteResponse.status()).toBe(201);
    const createFavoriteBody = await createFavoriteResponse.json();
    const favoriteId = createFavoriteBody.data.id;
    expect(createFavoriteBody.data.attributes.note).toBe('Testing Note 1');

    // 3. Edit Note in favorite
    const editNoteResponse = await request.patch(`/api/favorites/${favoriteId}`, {
      data: { 
        note: 'Edited Note 2' 
      },
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    expect(editNoteResponse.status()).toBe(200);
    const editNoteBody = await editNoteResponse.json();
    expect(editNoteBody.data.attributes.note).toBe('Edited Note 2');

    // 4. GET Favorite
    const getFavoriteResponse = await request.get(`/api/favorites/${favoriteId}`, {
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    expect(getFavoriteResponse.status()).toBe(200);
    const getFavoriteBody = await getFavoriteResponse.json();
    expect(getFavoriteBody.data.id).toBe(favoriteId);
    expect(getFavoriteBody.data.attributes.note).toBe('Edited Note 2');

    // 5. Clear all favorites
    const clearAllResponse = await request.delete('/api/favorites/clear_all', {
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    expect(clearAllResponse.status()).toBe(204);

    // 6. GET stored favorites — expect empty list
    const finalListResponse = await request.get('/api/favorites', {
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    expect(finalListResponse.status()).toBe(200);
    const finalListBody = await finalListResponse.json();
    expect(Array.isArray(finalListBody.data)).toBeTruthy();
    expect(finalListBody.data).toEqual([]);
  });
});
