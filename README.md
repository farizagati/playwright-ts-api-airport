# AirportGap API Test Suite

This repository provides a comprehensive set of **API test automations** using **Playwright** with **TypeScript** for the [AirportGap API](https://airportgap.com/docs). It covers endpoints for airports, distance calculations, authentication, and favorites management, including both parameterized and chained workflows.

---
# Setup Instructions

## Clone the repository

```
git clone https://github.com/farizagati/playwright-ts-api-airport.git
```
## Install dependencies
```
npm install
```

## Run all tests
```
npx playwright test
```
you can also use the UI mode by running this:
```
npx playwright test --ui
```

## Config Details
- Base URL: https://airportgap.com/api
- Content-Type: JSON (application/json)
- Authorization: Bearer token retrieved via /tokens API
- Global Setup: Token generated using APIRequestContext for reuse

# References
- https://airportgap.com/docs
- https://playwright.dev/docs/api-testing
