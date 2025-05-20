import 'express-session';

// Extend the SessionData interface from express-session
declare module 'express-session' {
  interface SessionData {
    nylasGrantId?: string;
    usingMockGrant?: boolean;
  }
}