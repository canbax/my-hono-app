// src/App.tsx

import { useState } from "react";
import "./App.css";

// Define the types for our API limitations and structures
interface ApiParam {
  name: string;
  type: "text" | "number" | "date" | "select";
  description: string;
  placeholder?: string;
  defaultValue?: string | number;
  options?: string[]; // For select type
  required?: boolean;
}

interface ApiEndpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  params: ApiParam[];
}

// Define the endpoints from src/worker/index.ts
const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/searchPlaces",
    description: "Search for places by text query.",
    params: [
      {
        name: "q",
        type: "text",
        description: "Search query (e.g., 'Ankara')",
        placeholder: "Place name",
        required: true,
      },
      {
        name: "lang",
        type: "text",
        description: "Language code (e.g., 'tr', 'en')",
        defaultValue: "en",
      },
      {
        name: "lat",
        type: "number",
        description: "Latitude for proximity check",
        placeholder: "40.00",
      },
      {
        name: "lng",
        type: "number",
        description: "Longitude for proximity check",
        placeholder: "32.85",
      },
      {
        name: "countryCode",
        type: "text",
        description: "Filter by country code (e.g., 'TR')",
        placeholder: "TR",
      },
    ],
  },
  {
    method: "GET",
    path: "/api/nearByPlaces",
    description: "Find places near specific GPS coordinates.",
    params: [
      {
        name: "lat",
        type: "number",
        description: "Latitude",
        placeholder: "40.00",
        required: true,
      },
      {
        name: "lng",
        type: "number",
        description: "Longitude",
        placeholder: "32.85",
        required: true,
      },
      {
        name: "lang",
        type: "text",
        description: "Language code",
        defaultValue: "en",
      },
      {
        name: "resultCount",
        type: "number",
        description: "Number of results to return",
        defaultValue: 5,
      },
    ],
  },
  {
    method: "GET",
    path: "/api/placeById",
    description: "Get detailed information about a place by its ID.",
    params: [
      {
        name: "id",
        type: "number",
        description: "Place ID",
        placeholder: "12345",
        required: true,
      },
      {
        name: "lang",
        type: "text",
        description: "Language code",
        defaultValue: "en",
      },
    ],
  },
  {
    method: "GET",
    path: "/api/timesForGPS",
    description: "Get prayer times for specific coordinates.",
    params: [
      {
        name: "lat",
        type: "number",
        description: "Latitude",
        placeholder: "39.92",
        required: true,
      },
      {
        name: "lng",
        type: "number",
        description: "Longitude",
        placeholder: "32.85",
        required: true,
      },
      {
        name: "date",
        type: "date",
        description: "Date (YYYY-MM-DD)",
        required: true,
      },
      {
        name: "days",
        type: "number",
        description: "Number of days (max 1000)",
        defaultValue: 3,
      },
      {
        name: "timezoneOffset",
        type: "number",
        description: "Timezone offset in minutes",
        defaultValue: 180,
      },
      {
        name: "calculationMethod",
        type: "text",
        description: "Calculation method (e.g., 'Turkey')",
        defaultValue: "Turkey",
      },
    ],
  },
  {
    method: "GET",
    path: "/api/timesForPlace",
    description: "Get prayer times for a specific place ID.",
    params: [
      {
        name: "id",
        type: "number",
        description: "Place ID",
        placeholder: "311034",
        required: true,
      },
      {
        name: "date",
        type: "date",
        description: "Date (YYYY-MM-DD)",
        required: true,
      },
      {
        name: "days",
        type: "number",
        description: "Number of days",
        defaultValue: 3,
      },
      {
        name: "timezoneOffset",
        type: "number",
        description: "Timezone offset in minutes",
        defaultValue: 180,
      },
      {
        name: "calculationMethod",
        type: "text",
        description: "Calculation method",
        defaultValue: "Turkey",
      },
    ],
  },
  {
    method: "GET",
    path: "/api/countries",
    description: "Get a list of all available countries.",
    params: [],
  },
  {
    method: "GET",
    path: "/api/regions",
    description: "Get a list of regions for a specific country.",
    params: [
      {
        name: "country",
        type: "text",
        description: "Country name (e.g., 'Turkey', 'Germany')",
        required: true,
      },
    ],
  },
  {
    method: "GET",
    path: "/api/cities",
    description: "Get cities/districts within a region.",
    params: [
      {
        name: "country",
        type: "text",
        description: "Country name",
        required: true,
      },
      {
        name: "region",
        type: "text",
        description: "Region name",
        required: true,
      },
    ],
  },
  {
    method: "GET",
    path: "/api/coordinates",
    description: "Get coordinates for a specific location hierarchy.",
    params: [
      {
        name: "country",
        type: "text",
        description: "Country name",
        required: true,
      },
      {
        name: "region",
        type: "text",
        description: "Region name",
        required: true,
      },
      {
        name: "city",
        type: "text",
        description: "City name",
        required: true,
      },
    ],
  },
  {
    method: "GET",
    path: "/api/place",
    description: "Reverse geocoding: Find place data from coordinates.",
    params: [
      {
        name: "lat",
        type: "number",
        description: "Latitude",
        required: true,
      },
      {
        name: "lng",
        type: "number",
        description: "Longitude",
        required: true,
      },
    ],
  },
  {
    method: "GET",
    path: "/api/ip",
    description: "Get the requester's IP address.",
    params: [],
  },
];

function EndpointTester({ endpoint }: { endpoint: ApiEndpoint }) {
  const [params, setParams] = useState<Record<string, string | number>>(
    endpoint.params.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: param.defaultValue || "",
      }),
      {}
    )
  );
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Filter out empty optional params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const url = `${endpoint.path}?${queryParams.toString()}`;
      const res = await fetch(url, {
        method: endpoint.method,
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="endpoint-card">
      <div className="endpoint-header">
        <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
          {endpoint.method}
        </span>
        <code className="endpoint-path">{endpoint.path}</code>
      </div>
      <p className="endpoint-description">{endpoint.description}</p>

      {endpoint.params.length > 0 && (
        <div className="params-container">
          <h4>Parameters</h4>
          <div className="params-grid">
            {endpoint.params.map((param) => (
              <div key={param.name} className="param-item">
                <label htmlFor={`${endpoint.path}-${param.name}`}>
                  {param.name}{param.required && <span className="required">*</span>}
                </label>
                <input
                  id={`${endpoint.path}-${param.name}`}
                  type={param.type}
                  placeholder={param.placeholder || param.description}
                  value={params[param.name] || ""}
                  onChange={(e) =>
                    setParams({ ...params, [param.name]: e.target.value })
                  }
                />
                <span className="param-help">{param.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-row">
        <button onClick={handleRun} disabled={loading} className="run-button">
          {loading ? "Running..." : "Try it out"}
        </button>
      </div>

      {error && <div className="response-error">Error: {error}</div>}
      {response && (
        <div className="response-container">
          <h4>Response</h4>
          <pre className="json-response">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Namaz Vakti API Documentation</h1>
        <p>
          Explore and test the API endpoints for prayer times and location data.
          Free, open-source, and ad-free.
        </p>
        <div className="header-links">
          <a
            href="https://github.com/canbax/namaz-vakti-api"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repository
          </a>
          <a href="https://vaktiapp.com/" target="_blank" rel="noreferrer">
            Vakti App
          </a>
        </div>
      </header>

      <div className="endpoints-list">
        {endpoints.map((endpoint, index) => (
          <EndpointTester key={index} endpoint={endpoint} />
        ))}
      </div>

      <footer className="main-footer">
        <p>
          Built with React, Hono, and Cloudflare Workers.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Yusuf Sait Canbaz.
        </p>
      </footer>
    </div>
  );
}

export default App;
