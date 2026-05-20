/**
 * Auth.js (NextAuth v5) — Google OAuth only.
 *
 * Authorization model:
 *   - Anyone with a Google account can sign in with Google.
 *   - On sign-in, we look up their email across three tables:
 *       channel_partners (status='approved')
 *       developer_users  (status='active')
 *       customer_users   (status='active')
 *   - If found in ANY of those, sign-in is allowed and the session carries
 *     the matching portal (cp / developer / customer) + user_id.
 *   - If not found anywhere, sign-in is rejected. The login page shows a
 *     "your email isn't approved yet" message.
 *
 * The same NextAuth instance serves all three portals. The redirect after
 * sign-in is decided by which table the email matches (in priority order:
 * cp > developer > customer), or by the explicit ?callbackUrl query param.
 */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';

declare module 'next-auth' {
  interface Session {
    portals?: Array<'cp' | 'developer' | 'customer'>;
    cpId?: number;
    cpStatus?: string;
    developerId?: number;
    developerName?: string;
    role?: string;
    customerId?: number;
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
  interface JWT {
    portals?: Array<'cp' | 'developer' | 'customer'>;
    cpId?: number;
    cpStatus?: string;
    developerId?: number;
    developerName?: string;
    role?: string;
    customerId?: number;
  }
}

type LookupResult = {
  portals: Array<'cp' | 'developer' | 'customer'>;
  cpId?: number;
  cpStatus?: string;
  developerId?: number;
  developerName?: string;
  role?: string;
  customerId?: number;
};

export async function lookupUserByEmail(email: string): Promise<LookupResult> {
  await ensureSchema();
  const db = getDb();
  const lc = email.trim().toLowerCase();
  const portals: LookupResult['portals'] = [];
  const out: LookupResult = { portals };

  const cpRow = await db.execute({
    sql: `SELECT id, status FROM channel_partners WHERE LOWER(email) = ? LIMIT 1`,
    args: [lc],
  });
  const cp = rowsAs<{ id: number; status: string }>(cpRow)[0];
  if (cp && cp.status === 'approved') {
    portals.push('cp');
    out.cpId = cp.id;
    out.cpStatus = cp.status;
  } else if (cp) {
    // Pending / rejected / suspended — record it so login page can hint
    out.cpStatus = cp.status;
  }

  const devRow = await db.execute({
    sql: `SELECT du.id, du.developer_id, du.role, d.name AS developer_name
          FROM developer_users du JOIN developers d ON d.id = du.developer_id
          WHERE LOWER(du.email) = ? AND du.status = 'active' LIMIT 1`,
    args: [lc],
  });
  const dev = rowsAs<{ id: number; developer_id: number; role: string; developer_name: string }>(devRow)[0];
  if (dev) {
    portals.push('developer');
    out.developerId = dev.developer_id;
    out.developerName = dev.developer_name;
    out.role = dev.role;
  }

  const custRow = await db.execute({
    sql: `SELECT id FROM customer_users WHERE LOWER(email) = ? AND status = 'active' LIMIT 1`,
    args: [lc],
  });
  const cust = rowsAs<{ id: number }>(custRow)[0];
  if (cust) {
    portals.push('customer');
    out.customerId = cust.id;
  }

  return out;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: { signIn: '/auth/signin', error: '/auth/error' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const lookup = await lookupUserByEmail(user.email);
      if (lookup.portals.length === 0) {
        // Build a hint in the URL so the error page can show a useful message
        const reason = lookup.cpStatus ? `cp_${lookup.cpStatus}` : 'not_approved';
        return `/auth/error?reason=${reason}&email=${encodeURIComponent(user.email)}`;
      }
      // Update last_login_at
      const db = getDb();
      try {
        if (lookup.developerId) {
          await db.execute({
            sql: `UPDATE developer_users SET last_login_at = datetime('now') WHERE LOWER(email) = ?`,
            args: [user.email.toLowerCase()],
          });
        }
        if (lookup.customerId) {
          await db.execute({
            sql: `UPDATE customer_users SET last_login_at = datetime('now') WHERE LOWER(email) = ?`,
            args: [user.email.toLowerCase()],
          });
        }
      } catch {
        // last_login is non-critical
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const lookup = await lookupUserByEmail(user.email);
        token.portals = lookup.portals;
        token.cpId = lookup.cpId;
        token.cpStatus = lookup.cpStatus;
        token.developerId = lookup.developerId;
        token.developerName = lookup.developerName;
        token.role = lookup.role;
        token.customerId = lookup.customerId;
      }
      return token;
    },
    async session({ session, token }) {
      session.portals = token.portals as Array<'cp' | 'developer' | 'customer'> | undefined;
      session.cpId = token.cpId as number | undefined;
      session.cpStatus = token.cpStatus as string | undefined;
      session.developerId = token.developerId as number | undefined;
      session.developerName = token.developerName as string | undefined;
      session.role = token.role as string | undefined;
      session.customerId = token.customerId as number | undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Honour relative or same-origin URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    },
  },
});
