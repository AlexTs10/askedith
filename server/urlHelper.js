/**
 * URL Helper Utilities
 * 
 * This module provides utilities for generating dynamic URLs based on the current request
 * to avoid hardcoding domain names and support multiple environments.
 */

/**
 * Generate the base URL from the request object
 * @param {Object} req - Express request object
 * @returns {string} - Base URL (e.g., "https://domain.com")
 */
export function getBaseUrl(req) {
  // Safety check for request object
  if (!req || typeof req.get !== 'function') {
    console.error('Invalid request object passed to getBaseUrl');
    throw new Error('Request object is required and must have get() method');
  }
  
  // Check for forwarded protocol first (for reverse proxies)
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  
  // Get the host from various possible headers
  const host = req.get('x-forwarded-host') || req.get('host');
  
  if (!host) {
    throw new Error('Unable to determine host from request headers');
  }
  
  return `${protocol}://${host}`;
}

/**
 * Generate a callback URL for OAuth flows
 * @param {Object} req - Express request object
 * @param {string} path - Callback path (default: '/callback')
 * @returns {string} - Full callback URL
 */
export function generateCallbackUrl(req, path = '/callback') {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}${path}`;
}

/**
 * Generate API callback URL
 * @param {Object} req - Express request object
 * @param {string} path - API callback path (default: '/api/nylas/callback')
 * @returns {string} - Full API callback URL
 */
export function generateApiCallbackUrl(req, path = '/api/nylas/callback') {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}${path}`;
}

/**
 * Check if the current environment is development
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get allowed redirect URIs for the current environment
 * This can be useful for validation
 * @param {Object} req - Express request object
 * @returns {Array<string>} - Array of allowed redirect URIs
 */
export function getAllowedRedirectUris(req) {
  const baseUrl = getBaseUrl(req);
  
  return [
    `${baseUrl}/callback`,
    `${baseUrl}/api/nylas/callback`,
    `${baseUrl}/auth/callback`
  ];
}