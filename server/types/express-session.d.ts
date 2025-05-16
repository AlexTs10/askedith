import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    nylasAccessToken?: string; // For backward compatibility
    nylasGrantId?: string; // New V3 Nylas grant ID
  }
}