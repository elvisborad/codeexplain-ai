const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
