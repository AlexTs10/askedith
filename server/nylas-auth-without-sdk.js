/**
 * Nylas Auth Integration Without SDK
 * 
 * This file provides a simple integration with Nylas Authorization APIs
 * without using their SDK, which may have compatibility issues.
 */

import fetch from 'node-fetch';

// Base API URL for Nylas
const API_BASE_URL = 'https://api.nylas.com';

/**
 * Generate an OAuth URL for connecting a user's email account
 * @param {string} email - The user's email address
 * @returns {string} The authorization URL
 */
export function generateAuthUrl(email) {
  try {
    // Get credentials from environment variables
    const clientId = process.env.NYLAS_CLIENT_ID;
    
    // This must match exactly what's registered in the Nylas dashboard
    const redirectUri = 'https://askcara-project.elias18.repl.co/callback';
    
    // Required permissions (scopes) for email access
    const scopes = 'email.read_only email.modify email.send email.folders.read_only email.folders.modify';
    
    // Log the client ID to help troubleshoot (first few chars only for security)
    const clientIdPreview = clientId.substring(0, 8) + '...';
    console.log(`Using Nylas client ID: ${clientIdPreview}`);
    
    // Generate the authorization URL
    const authUrl = `${API_BASE_URL}/oauth/authorize?` +
                   `client_id=${clientId}&` +
                   `response_type=code&` +
                   `scope=${encodeURIComponent(scopes)}&` +
                   `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                   `login_hint=${encodeURIComponent(email)}`;
    
    console.log('Generated auth URL (domain only for security):', 
                authUrl.substring(0, authUrl.indexOf('?') + 20) + '...');
    
    return authUrl;
  } catch (error) {
    console.error('Error generating Nylas auth URL:', error);
    throw error;
  }
}

/**
 * Exchange an authorization code for an access token
 * @param {string} code - The authorization code from the callback
 * @returns {Promise<string>} The access token
 */
export async function exchangeCodeForToken(code) {
  try {
    const clientId = process.env.NYLAS_CLIENT_ID;
    const clientSecret = process.env.NYLAS_CLIENT_SECRET;
    const redirectUri = 'https://askcara-project.elias18.repl.co/callback';
    
    console.log('Exchanging code for token with redirect URI:', redirectUri);
    
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange error:', errorText);
      throw new Error(`Failed to exchange code: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Token exchange successful');
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}