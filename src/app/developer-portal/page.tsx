import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function DeveloperPortalRoot() {
  const session = await auth();
  if (session?.portals?.includes('developer')) redirect('/developer-portal/dashboard');
  redirect('/developer-portal/login');
}
