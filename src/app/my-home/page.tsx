import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function MyHomeRoot() {
  const session = await auth();
  if (session?.portals?.includes('customer')) redirect('/my-home/dashboard');
  redirect('/my-home/login');
}
