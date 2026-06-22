# Architecture

This document describes the structure, data flow, and key design decisions of the weather dashboard.

---

## Component Hierarchy

```
main.tsx
└── ThemeProvider          (context/ThemeContext.tsx)
    └── ErrorBoundary      (components/ErrorBoundary.tsx)
        └── App            (App.tsx)
            ├── Header
            │   ├── ThemeToggle        (components/ThemeToggle.tsx)
            │   ├── TemperatureToggle  (components/TemperatureToggle.tsx)
            │   └── SearchBar          (components/SearchBar.tsx)
            ├── Status panel (inline in App)
            └── Main content
                ├── LoadingSpinner     (components/LoadingSpinner.tsx)
                ├── CurrentWeather     (components/CurrentWeather.tsx)
                ├── HourlyForecast     (components/HourlyForecast.tsx)
                ├── WeatherAlerts      (components/WeatherAlerts.tsx)
                └── DailyForecast      (components/DailyForecast.tsx)
```

---

## Data Flow

```
User interaction / geolocation
        │
        ▼
   App (state owner)
        │  calls
        ▼
  weatherApi.ts  ──fetch──▶  Open-Meteo APIs
        │  returns WeatherData
        ▼
   App sets weather state
        │  passes props
        ▼
  Presentation components
```

All weather state lives in `App`. Child components are purely presentational — they receive data via props and emit events via callbacks.

---

## Open-Meteo API Integration

The app uses two Open-Meteo endpoints, both of which are free with no API key.

### Geocoding API

**Base URL:** `https://geocoding-api.open-meteo.com/v1`

| Endpoint        | Purpose                                  |
|-----------------|------------------------------------------|
| `GET /search`   | City autocomplete by name                |
| `GET /reverse`  | Reverse geocoding from lat/lon           |

### Forecast API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

Parameters used:

| Parameter  | Fields requested |
|------------|-----------------|
| `current`  | temperature, apparent temperature, humidity, wind speed, UV index, pressure, visibility, weather code, is_day, precipitation |
| `hourly`   | temperature, precipitation probability, weather code, wind speed (first 24 hours) |
| `daily`    | weather code, max/min temperature, precipitation probability (5 days) |

Responses are mapped to internal TypeScript interfaces in `src/types/weather.ts`.

---

## State Management

The app uses React's built-in state and context — no external state library.

| Concern              | Location                    | Mechanism              |
|----------------------|-----------------------------|------------------------|
| Weather data         | `App`                       | `useState`             |
| Loading / error      | `App`                       | `useState`             |
| Selected location    | `App`                       | `useState`             |
| Temperature unit     | `App` + `localStorage`      | `useState` + effect    |
| Theme (dark/light)   | `ThemeContext`              | Context + `useState`   |

---

## Caching Strategy

API responses are cached in `localStorage` by `src/services/weatherApi.ts`:

| Data type          | Cache key pattern                          | TTL        |
|--------------------|--------------------------------------------|------------|
| Forecast + alerts  | `weather-dashboard-cache:forecast:<lat>:<lon>` | 10 minutes |
| City search        | `weather-dashboard-cache:search:<query>`   | 24 hours   |

Stale entries are evicted lazily on the next read. Geolocation-based forecasts bypass the cache (`persistToStorage: false`) because coordinates may differ slightly between sessions.

---

## Performance Optimizations

- `React.memo` is applied to all pure presentational components to prevent unnecessary re-renders when unrelated parent state changes.
- Vite's `manualChunks` configuration splits the React runtime into its own chunk for better long-term caching.
- The `SearchBar` debounces geocoding requests by 250 ms and cancels in-flight requests via a request counter.
- API results are served from `localStorage` cache before any network request is made.
