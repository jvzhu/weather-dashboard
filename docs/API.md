# API Reference

This document describes the external APIs consumed by the weather dashboard.

All requests are made client-side directly from the browser. No backend proxy is required.

---

## Geocoding API

**Base URL:** `https://geocoding-api.open-meteo.com/v1`

### City Search

Searches for cities by name and returns up to 6 matching suggestions.

```
GET /search?name={query}&count=6&language=en&format=json
```

**Parameters**

| Name       | Type   | Description                    |
|------------|--------|--------------------------------|
| `name`     | string | Partial or full city name      |
| `count`    | number | Maximum results (default: 6)   |
| `language` | string | Response language (default: en)|
| `format`   | string | Always `json`                  |

**Response**

```json
{
  "results": [
    {
      "name": "London",
      "country": "United Kingdom",
      "admin1": "England",
      "latitude": 51.50853,
      "longitude": -0.12574,
      "timezone": "Europe/London"
    }
  ]
}
```

Results are cached in `localStorage` for 24 hours per query string.

---

### Reverse Geocoding

Resolves a latitude/longitude pair to the nearest city.

```
GET /reverse?latitude={lat}&longitude={lon}&count=1&language=en&format=json
```

**Parameters**

| Name        | Type   | Description         |
|-------------|--------|---------------------|
| `latitude`  | number | Decimal degrees     |
| `longitude` | number | Decimal degrees     |
| `count`     | number | Always `1`          |
| `language`  | string | Response language   |
| `format`    | string | Always `json`       |

Returns the same shape as the city search response. Returns `null` when no result is found.

---

## Forecast API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

### Weather Forecast

Fetches current conditions, 24-hour hourly data, and a 5-day daily outlook in a single request.

```
GET /forecast?latitude={lat}&longitude={lon}&timezone=auto
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,
           wind_speed_10m,uv_index,surface_pressure,visibility,
           weather_code,is_day,precipitation
  &hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min,
         precipitation_probability_max
  &forecast_days=5
```

**Response shape (abbreviated)**

```json
{
  "timezone": "America/New_York",
  "current": {
    "time": "2024-01-15T12:00",
    "temperature_2m": 20.4,
    "apparent_temperature": 18.1,
    "relative_humidity_2m": 65,
    "wind_speed_10m": 10.2,
    "uv_index": 3.0,
    "surface_pressure": 1013,
    "visibility": 10000,
    "weather_code": 0,
    "is_day": 1,
    "precipitation": 0.0
  },
  "hourly": { "time": [...], "temperature_2m": [...], ... },
  "daily":  { "time": [...], "temperature_2m_max": [...], ... }
}
```

Forecast data is cached per coordinate pair (3 decimal places) for 10 minutes.

---

### Alerts Fetch

A separate call is made to the same endpoint with `alerts=true` to retrieve any active weather alerts.

```
GET /forecast?latitude={lat}&longitude={lon}&timezone=auto&alerts=true
```

The response may include an `alerts` or `warnings` field. The app normalises both GeoJSON feature collections and plain arrays into a consistent `WeatherAlert[]` shape. Returns an empty array if the field is absent or the request fails.

---

## Rate Limiting

Open-Meteo is a free, open API with **no API key required**. The service applies fair-use rate limits on the server side. To stay well within those limits the dashboard:

- Caches city searches for **24 hours**.
- Caches forecasts for **10 minutes**.
- Debounces search input by **250 ms** to avoid firing a request on every keystroke.

---

## Error Handling

All API calls go through a shared `fetchJson` helper that throws a descriptive error on non-2xx responses:

```
Error: Request failed with status 429
```

- Network errors and non-OK responses bubble up to `App`, which displays a user-friendly message in the status panel.
- The alerts fetch is wrapped in a try/catch so an alert failure never blocks the main forecast from rendering.
