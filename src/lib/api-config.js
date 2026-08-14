// API Configuration
// This file manages the API configuration for switching between mock and real backends

const API_CONFIG = {
  // Base URL for API requests
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',

  // Request timeout in milliseconds
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),

  // Use mock data (localStorage) instead of real API
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  // Enable debug logging
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',

  // API endpoints (for future use with real backend)
  endpoints: {
    nurses: '/nurses',
    departments: '/departments',
    schedules: '/schedules',
    assignments: '/assignments',
    availability: '/availability',
    notifications: '/notifications',
    auth: '/auth'
  }
};

// Request interceptor for adding auth token
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Log function that respects debug flag
export function debugLog(...args) {
  if (API_CONFIG.enableDebugLogs) {
    console.log('[API]', ...args);
  }
}

// Error handler for API responses
export function handleApiError(error) {
  debugLog('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.message || error.message || 'Unknown error occurred';

    return {
      status,
      message,
      data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: 'Network error: No response from server',
      data: null
    };
  } else {
    // Error in request setup
    return {
      status: 0,
      message: error.message || 'Unknown error',
      data: null
    };
  }
}

export default API_CONFIG;
