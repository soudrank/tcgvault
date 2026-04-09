import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/settings/ProfileForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get card count for the plan section
  const { count: cardCount } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 720, margin: '0 auto' }} className="md:px-6 lg:px-8">
      <ProfileForm
        email={user.email ?? ''}
        createdAt={user.created_at}
        cardCount={cardCount ?? 0}
      />
    </div>
  );
}
