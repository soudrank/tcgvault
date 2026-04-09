import '../app.css';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import SidebarHandler from '@/components/layout/SidebarHandler';
import { createClient } from '@/lib/supabase/server';
import { getCards } from '@/lib/actions/cards';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let cardCount = 0;
  try {
    const cards = await getCards();
    cardCount = cards.length;
  } catch {
    // ignore
  }

  const email = user?.email ?? '';
  const userInitial = email ? email[0].toUpperCase() : 'U';

  return (
    <>
      <Sidebar
        cardCount={cardCount}
        userInitial={userInitial}
        userName={email.split('@')[0]}
      />
      <MobileHeader />
      <SidebarHandler />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}
