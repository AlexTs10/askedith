/**
 * Direct Nylas Grant ID Implementation
 * 
 * This is a simplified implementation for testing with a direct grant ID.
 */

// The specific grant ID we want to use
const PRESET_GRANT_ID = '5bd4e911-f684-4141-bc83-247e2077c9a5';

/**
 * Get the stored grant ID
 */
export function getGrantId() {
  return PRESET_GRANT_ID;
}

/**
 * This is a direct check to see if the stored grant ID is valid
 * In a real implementation, we would validate this against the Nylas API
 */
export function isValidGrantId() {
  return PRESET_GRANT_ID && PRESET_GRANT_ID.length > 10;
}

/**
 * Store this grant ID in session when called
 */
export function storeGrantIdInSession(req) {
  if (req.session) {
    req.session.nylasGrantId = PRESET_GRANT_ID;
    return true;
  }
  return false;
}