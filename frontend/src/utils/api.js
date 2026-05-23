let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Strip any trailing slash
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

// Automatically append /api if it is missing
if (!rawUrl.endsWith('/api')) {
  rawUrl = rawUrl + '/api';
}

const API_BASE_URL = rawUrl;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    const text = await response.text();
    if (text.trim().startsWith('<!DOCTYPE')) {
      throw new Error(`API Config Error: Received HTML instead of JSON. Deployed frontend is calling: "${API_BASE_URL}${endpoint}". Please configure VITE_API_URL on Vercel and trigger a redeploy.`);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
