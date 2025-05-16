import 'express-session';

declare module 'express-session' {
  interface SessionData {
    nylasAccessToken?: string;
  }
}