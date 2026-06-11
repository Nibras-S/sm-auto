import type { JwtPayload } from '@sm/shared';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by the `authenticate` / `optionalAuth` middleware. */
      auth?: JwtPayload;
    }
  }
}

export {};
