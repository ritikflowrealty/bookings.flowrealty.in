import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession, PORTAL_COOKIE } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';

export default async function DeveloperPortalRoot() {
  const store = await cookies();
  const session = await getSession(store.get(PORTAL_COOKIE.developer)?.value);
  if (session?.portal === 'developer') redirect('/developer-portal/dashboard');
  redirect('/developer-portal/login');
}
