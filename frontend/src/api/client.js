// ─── NSS 2.0 API Client ──────────────────────────────────────────────────────
// Reads VITE_API_URL at build time (injected by Vite from .env or Vercel env vars).
// If not set, defaults to the production Render backend so the build still works.
// Local dev: set VITE_API_URL=http://localhost:5000/api in .env
// Production: set VITE_API_URL=https://nss-2-0.onrender.com/api in Vercel env vars

function buildFullUrl(endpoint) {
  // Default to production backend if VITE_API_URL is not set
  let baseUrl = (import.meta.env.VITE_API_URL || 'https://nss-2-0.onrender.com/api').trim();

  // Strip trailing slashes
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Ensure baseUrl ends with /api if it doesn't already
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }

  // Ensure endpoint starts with /
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If cleanEndpoint starts with /api/, strip the leading /api to prevent /api/api/...
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  return `${baseUrl}${cleanEndpoint}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nss_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body);
  }

  const fullUrl = buildFullUrl(endpoint);

  try {
    const res = await fetch(fullUrl, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${fullUrl}]:`, err.message);
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(`Failed to fetch. Unable to connect to backend server (${fullUrl}). Please verify network connection and CORS headers.`);
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};
