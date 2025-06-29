import { test, expect, request as playwrightRequest } from '@playwright/test';

let authToken: string;

// Obtain an API token once before all tests
test.beforeAll(async () => {
  const requestContext = await playwrightRequest.newContext();
  const tokenResponse = await requestContext.post('https://airportgap.com/api/tokens', {
    data: { 
        email: 'akuntesares01+1@gmail.com', // YOUR EMAIL HERE
        password: 'YoNdakTauKokTanyaSaya' // YOUR PASSWORD HERE
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
    const firstNote = 'Testing Note 1'
    const editedNote = 'Changed Note 2'

    // 1. GET Airport list
    const airportListResponse = await request.get('/api/airports');
    // Assert HTTP status response
    expect(airportListResponse.status()).toBe(200);

    //Assert response structure
    const airportListBody = await airportListResponse.json();
    expect(Array.isArray(airportListBody.data)).toBeTruthy();
    //get the data array 0
    const airportId = airportListBody.data[0].id;
    expect(airportId).toBe('GKA');

    // 2. Add Airport to Favorite
    const createFavoriteResponse = await request.post('/api/favorites', {
      data: { 
        airport_id: airportId, 
        note: firstNote //obtain from defined note above
      },
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json'
      }
    });
    //assert http status
    expect(createFavoriteResponse.status()).toBe(201);
    //assert response and value from favorite data
    const createFavoriteBody = await createFavoriteResponse.json();
    const favoriteId = createFavoriteBody.data.id;
    expect(createFavoriteBody.data.attributes.note).toBe(firstNote);

    // 3. Edit Note in favorite
    const editNoteResponse = await request.patch(`/api/favorites/${favoriteId}`, {
      data: { 
        note: editedNote //obtain from defined note above
      },
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    //assert http status
    expect(editNoteResponse.status()).toBe(200);
    //assert edited note
    const editNoteBody = await editNoteResponse.json();
    expect(editNoteBody.data.attributes.note).toBe(editedNote);

    // 4. GET Favorite
    const getFavoriteResponse = await request.get(`/api/favorites/${favoriteId}`, {
      headers: { 
        Authorization: `Token ${authToken}`, 
        Accept: 'application/json' 
      }
    });
    //assert http status
    expect(getFavoriteResponse.status()).toBe(200);
    //assert edited note
    const getFavoriteBody = await getFavoriteResponse.json();
    expect(getFavoriteBody.data.id).toBe(favoriteId);
    expect(getFavoriteBody.data.attributes.note).toBe(editedNote);

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
    //assert http status
    expect(finalListResponse.status()).toBe(200);
    //assert stored favorites should be empty
    const finalListBody = await finalListResponse.json();
    expect(Array.isArray(finalListBody.data)).toBeTruthy();
    expect(finalListBody.data).toEqual([]);
  });
});
