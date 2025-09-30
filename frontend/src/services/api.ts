/**
 * @file api.ts
 * @description Axios instance configuration for API requests with CSRF token management
 * 
 * This file configures an Axios instance with:
 * - Base URL pointing to the Django backend server
 * - Default headers for JSON communication
 * - CSRF token management for cross-origin requests
 * - Request interceptor for attaching auth tokens and CSRF tokens
 * - Response interceptor for handling authentication errors
 */

import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

/**
 * @constant CSRF_TOKEN_ENDPOINT
 * @description Endpoint URL for fetching CSRF tokens from Django backend
 * 
 * This endpoint is provided by Django's get_csrf_token view which:
 * - Sets the csrftoken cookie via @ensure_csrf_cookie decorator
 * - Returns the token value in the response body
 * - Allows unauthenticated access for password reset functionality
 */
const CSRF_TOKEN_ENDPOINT = 'http://localhost:8000/api/auth/csrf-token/'

/**
 * @variable csrfTokenPromise
 * @description Singleton promise for CSRF token fetching
 * 
 * This ensures we only fetch the CSRF token once per session, avoiding
 * unnecessary API calls while maintaining security.
 */
let csrfTokenPromise: Promise<string> | null = null

/**
 * @function fetchCsrfToken
 * @description Fetch CSRF token from Django backend with proper header attachment
 * 
 * This function implements a singleton pattern to ensure we only fetch the CSRF token
 * once per session. The token is automatically added to both global Axios defaults
 * and our custom API instance headers for all subsequent requests.
 * 
 * @returns {Promise<string>} Promise that resolves to the CSRF token string
 * 
 * @csrf_token_flow
 * 1. Check if token fetch is already in progress (singleton pattern)
 * 2. Make GET request to Django's CSRF token endpoint with credentials
 * 3. Django sets csrftoken cookie via @ensure_csrf_cookie decorator
 * 4. Extract token from response body and validate presence
 * 5. Set token in both global axios.defaults and api.defaults headers
 * 6. Return token for immediate use if needed
 * 
 * @header_attachment_strategy
 * - Sets token in axios.defaults.headers.common['X-CSRFToken'] for global usage
 * - Sets token in api.defaults.headers.common['X-CSRFToken'] for our custom instance
 * - This dual approach ensures token availability regardless of which Axios instance is used
 * - Headers are automatically included in all POST/PUT/DELETE/PATCH requests
 * 
 * @security_considerations
 * - withCredentials: true ensures cookies are sent/received in cross-origin requests
 * - Token is automatically included in X-CSRFToken header for all state-changing requests
 * - Token is tied to the Django session and will expire when session expires
 * - Failed requests reset the promise to allow retry on subsequent calls
 * 
 * @error_handling
 * - Validates token presence in response before setting headers
 * - Resets csrfTokenPromise to null on failure to allow retry
 * - Throws the original error for caller to handle with context
 * - Logs detailed error information for debugging purposes
 */
export const fetchCsrfToken = async (): Promise<string> => {
  if (!csrfTokenPromise) {
    console.log('[api] Initiating CSRF token fetch...');
    
    csrfTokenPromise = axios.get(CSRF_TOKEN_ENDPOINT, {
      withCredentials: true, // Essential for cross-origin cookie handling
    }).then(response => {
      const csrfToken = response.data.csrfToken;
      
      if (!csrfToken) {
        throw new Error('CSRF token not found in response');
      }
      
      // Set token in both global axios defaults and our custom api instance
      // This ensures the token is available for all requests
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
      api.defaults.headers.common['X-CSRFToken'] = csrfToken;
      console.log('[api] CSRF token fetched and set in both global and api instance headers');
      
      return csrfToken;
    }).catch(error => {
      console.error('[api] CSRF token fetch failed:', error);
      
      // Reset promise to allow retry
      csrfTokenPromise = null;
      
      // Log additional error details for debugging
      if (error.response) {
        console.error('[api] CSRF token fetch response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('[api] CSRF token fetch network error:', error.message);
      }
      
      throw error;
    });
  }
  
  return csrfTokenPromise;
}

/**
 * @function getCsrfTokenFromHeaders
 * @description Get the currently stored CSRF token from API instance headers
 * 
 * This function retrieves the CSRF token that was previously set by fetchCsrfToken.
 * It's useful for explicit header setting or debugging purposes.
 * 
 * @returns {string | null} The current CSRF token or null if not set
 * 
 * @usage_scenarios
 * - Explicit header setting for specific requests
 * - Debugging token presence in headers
 * - Validation that token was properly set
 * 
 * @header_retrieval_strategy
 * - Checks api.defaults.headers.common['X-CSRFToken'] first (our custom instance)
 * - Falls back to axios.defaults.headers.common['X-CSRFToken'] (global instance)
 * - Returns null if token is not found in either location
 */
export const getCsrfTokenFromHeaders = (): string | null => {
  // Check our custom API instance headers first
  const apiInstanceToken = api.defaults.headers.common['X-CSRFToken'] as string;
  if (apiInstanceToken) {
    return apiInstanceToken;
  }
  
  // Fall back to global axios headers
  const globalToken = axios.defaults.headers.common['X-CSRFToken'] as string;
  if (globalToken) {
    return globalToken;
  }
  
  return null;
}

/**
 * @function fetchCsrfTokenAndReturn
 * @description Fetch CSRF token and return both token value and explicit headers
 * 
 * This function is designed for cases where you need both the token value
 * and want to explicitly set headers in a specific request, providing a
 * fallback if the automatic header setting doesn't work.
 * 
 * @returns {Promise<{token: string, headers: Record<string, string>}>} Token and headers object
 * 
 * @explicit_header_usage
 * - Fetches token using the singleton pattern
 * - Returns token value for explicit use
 * - Returns headers object ready for spreading into request config
 * - Provides both automatic and manual header setting options
 * 
 * @error_handling
 * - Throws error if token fetch fails
 * - Validates token presence before returning
 * - Provides detailed error context for debugging
 */
export const fetchCsrfTokenAndReturn = async (): Promise<{
  token: string;
  headers: Record<string, string>;
}> => {
  try {
    console.log('[api] Fetching CSRF token for explicit header usage...');
    
    // Use the existing singleton fetch mechanism
    const token = await fetchCsrfToken();
    
    if (!token) {
      throw new Error('CSRF token is empty after fetch');
    }
    
    // Prepare headers object for explicit usage
    const headers = {
      'X-CSRFToken': token,
      'Content-Type': 'application/json'
    };
    
    console.log('[api] CSRF token and headers prepared for explicit usage');
    
    return { token, headers };
  } catch (error) {
    console.error('[api] Failed to fetch CSRF token for explicit usage:', error);
    throw error;
  }
}

/**
 * Configure the base URL to point to the Django backend server.
 * During development the backend runs on http://localhost:8000.
 *
 * Frontend-backend communication flow:
 * - React app calls this Axios instance for API requests.
 * - Requests are sent to Django's `/api/...` endpoints.
 * - Django processes the request (authentication, database operations).
 * - Response is returned to the frontend for UI updates.
 */
/**
 * Axios instance configuration with CORS considerations
 * 
 * @cors_configuration
 * - baseURL: Points to Django backend (must match CORS_ALLOWED_ORIGINS in Django)
 * - withCredentials: When true, allows cookies to be sent in cross-origin requests
 *   (must be used with CORS_ALLOW_CREDENTIALS=True in Django)
 * - xsrfCookieName/xsrfHeaderName: For Django's CSRF protection with cookies
 * 
 * @error_handling
 * - If you see "Network Error" or CORS errors in console, check:
 *   1. Django server is running
 *   2. baseURL matches an entry in Django's CORS_ALLOWED_ORIGINS
 *   3. Django's CORS_ALLOW_CREDENTIALS is True if withCredentials is true
 *   4. The origin is in CSRF_TRUSTED_ORIGINS for POST/PUT/DELETE requests
 */
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies in cross-origin requests (needed for CSRF)
  withCredentials: true,
  // Configure CSRF cookie and header names to match Django's defaults
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken'
})

/**
 * @function requestInterceptor
 * @description Request interceptor for adding authentication and CSRF tokens
 * 
 * This interceptor runs before every API request and handles:
 * - Authentication token attachment for authenticated requests
 * - CSRF token verification for state-changing requests
 * - Proper header configuration for cross-origin requests
 *
 * @param {InternalAxiosRequestConfig} config - The request configuration object
 * @returns {InternalAxiosRequestConfig} Modified request configuration
 *
 * @authentication_flow
 * - Checks localStorage for authentication token before each request
 * - Adds token to Authorization header if found
 * - Uses 'Token' authentication scheme expected by Django REST Framework
 *
 * @csrf_flow
 * - For POST/PUT/DELETE/PATCH requests, ensures CSRF token is present
 * - CSRF token should already be set in default headers by fetchCsrfToken
 * - Logs warning if CSRF token is missing for state-changing requests
 *
 * @cors_security
 * - Authentication headers are part of CORS "simple headers" and don't trigger preflight
 * - X-CSRFToken header does trigger preflight, handled by Django's CorsMiddleware
 * - withCredentials ensures cookies are sent for CSRF validation
 *
 * @error_handling
 * - Logs token presence for debugging
 * - Returns modified config or rejects with error
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add authentication token if available
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Token ${token}`
    }
    
    // Check for CSRF token on state-changing requests
    const isStateChangingRequest = ['post', 'put', 'patch', 'delete'].includes(
      config.method?.toLowerCase() || ''
    )
    
    if (isStateChangingRequest && config.headers) {
      const csrfToken = config.headers['X-CSRFToken']
      if (!csrfToken) {
        console.warn('[api] CSRF token missing for state-changing request to:', config.url)
        console.warn('[api] This may cause CSRF verification to fail')
      }
    }
    
    console.log('[api] Request interceptor:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuthToken: !!token,
      hasCsrfToken: !!config.headers?.['X-CSRFToken'],
      withCredentials: config.withCredentials
    })
    
    return config
  },
  (error: AxiosError) => {
    console.error('[api] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor for handling common errors such as token expiration.
 * If the backend returns 401/403 we clear the token and redirect to login.
 */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401 || status === 403) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Helper function to test connection to the backend API.
 * Can be used to verify the server is reachable and responsive.
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.get('/') // expecting Django to respond or 404 quickly
    return true
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}

export default api