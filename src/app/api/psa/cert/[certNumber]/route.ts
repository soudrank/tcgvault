import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchPsaCertData } from '@/lib/psa-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certNumber: string }> }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jwt = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { certNumber } = await params;
  if (!/^\d+$/.test(certNumber)) {
    return NextResponse.json({ error: 'Invalid certNumber' }, { status: 400 });
  }

  const result = await fetchPsaCertData(certNumber);
  if (!result) {
    return NextResponse.json({ error: 'PSA cert not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}
