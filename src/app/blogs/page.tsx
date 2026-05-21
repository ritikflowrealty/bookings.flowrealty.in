import { redirect } from 'next/navigation';

// /blogs redirects to /news (same content, different URL)
export default function BlogsRedirect() {
  redirect('/news');
}
