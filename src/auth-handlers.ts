/**
 * Re-export Auth.js HTTP handlers. Kept in a separate file from auth.ts so
 * server components and API routes can `import { auth } from '@/auth'`
 * without dragging the full handlers into their bundle.
 */
import { handlers } from './auth';

export const { GET, POST } = handlers;
