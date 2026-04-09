import { createClient } from '@/lib/supabase/client';

const BUCKET = 'card-images';

export async function uploadCardImage(
  file: File,
  userId: string,
  side: 'front' | 'back'
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}_${side}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`アップロードに失敗しました: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteCardImage(publicUrl: string): Promise<void> {
  const supabase = createClient();
  const parts = publicUrl.split(`/${BUCKET}/`);
  if (parts.length < 2) return;

  await supabase.storage.from(BUCKET).remove([parts[1]]);
}
