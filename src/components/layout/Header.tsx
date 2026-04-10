import { createClient } from '@/lib/supabase/server';
import UserMenu from './UserMenu';
import Link from 'next/link';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card-bg px-4 md:justify-end md:px-6">
      {/* モバイルのみ: ロゴ */}
      <Link href="/" className="text-lg font-bold text-foreground md:hidden">
        Trecaru
      </Link>

      <UserMenu email={user.email ?? ''} />
    </header>
  );
}
