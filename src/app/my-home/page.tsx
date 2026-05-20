import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession, PORTAL_COOKIE } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';

export default async function MyHomeRoot() {
  const store = await cookies();
  const session = await getSession(store.get(PORTAL_COOKIE.customer)?.value);
  if (session?.portal === 'customer') redirect('/my-home/dashboard');
  redirect('/my-home/login');
}
