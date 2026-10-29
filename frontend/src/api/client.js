/**
 * Central HTTP API Client for LaunchLoop AI Frontend.
 * Standardizes API communication, timeout handling, and RFC 7807 error formatting.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (data?.detail && typeof data.detail === 'object') {
        errorMessage = data.detail.message || JSON.stringify(data.detail);
      } else if (typeof data?.error?.message === 'string') {
        errorMessage = data.error.message;
      } else if (typeof data?.message === 'string') {
        errorMessage = data.message;
      }
      throw new ApiError(errorMessage, response.status, data?.error?.details || data?.detail || null);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network request failed', 0);
  }
}

/**
 * Health check probe
 */
export async function getBackendHealth() {
  return apiClient('/health');
}
