-- ============================================
-- トレカ投資・資産管理アプリ DBスキーマ
-- ============================================

-- カードタイトル（ポケカ、遊戯王、ワンピースなど）
create type card_title as enum ('pokemon', 'yugioh', 'onepiece', 'other');

-- 鑑定機関
create type grading_agency as enum ('PSA', 'BGS', 'CGC', 'ARS', 'none');

-- カードの状態
create type card_status as enum ('raw', 'submitted', 'graded', 'sold');

-- 経費カテゴリ
create type expense_category as enum ('grading', 'shipping', 'packaging', 'other');

-- ============================================
-- カードテーブル
-- ============================================
create table cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title card_title not null default 'pokemon',
  name text not null,
  image_url text,
  back_image_url text,

  -- 財務情報
  purchase_price integer not null default 0,       -- カード本体価格（円）
  purchase_shipping integer not null default 0,    -- 購入時送料（円）
  -- 仕入れ原価 = purchase_price + purchase_shipping（計算で導出）

  -- 鑑定情報
  grading_agency grading_agency not null default 'none',
  grade numeric(4,1),                              -- 例: 10.0, 9.5
  grading_cost integer not null default 0,         -- 鑑定費用（円）

  -- 相場・売却
  estimated_price integer not null default 0,      -- 現在の想定相場（円）
  sold_price integer,                              -- 売却価格（円, null=未売却）
  sold_at timestamptz,

  status card_status not null default 'raw',
  memo text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table cards enable row level security;

create policy "Users can manage own cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- インデックス
create index idx_cards_user_id on cards(user_id);
create index idx_cards_status on cards(user_id, status);

-- ============================================
-- 経費テーブル
-- ============================================
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references cards(id) on delete set null,
  category expense_category not null,
  amount integer not null,               -- 金額（円）
  description text,
  date date not null default current_date,

  created_at timestamptz default now() not null
);

-- RLS
alter table expenses enable row level security;

create policy "Users can manage own expenses"
  on expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_expenses_user_id on expenses(user_id);
create index idx_expenses_date on expenses(user_id, date);

-- ============================================
-- 相場履歴テーブル（将来拡張用）
-- ============================================
create table price_history (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references cards(id) on delete cascade not null,
  price integer not null,
  recorded_at timestamptz default now() not null
);

create index idx_price_history_card on price_history(card_id, recorded_at);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at
  before update on cards
  for each row execute function update_updated_at();
