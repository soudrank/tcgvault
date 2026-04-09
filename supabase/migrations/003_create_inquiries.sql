-- お問い合わせテーブル
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  category text not null default 'general',
  message text not null,
  created_at timestamptz default now()
);

-- RLS有効化
alter table public.inquiries enable row level security;

-- 誰でもinsert可能（ログイン不要でお問い合わせできるように）
create policy "Anyone can insert inquiries"
  on public.inquiries for insert
  with check (true);

-- 閲覧は管理者のみ（service_roleキーでのみ読み取り可能）
-- ユーザーからのselectは拒否
