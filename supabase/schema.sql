-- PFC診断：回答結果の保存テーブル
-- Supabase の SQL Editor に貼り付けて実行してください。

create table if not exists public.quiz_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null,          -- 'C' | 'F' | 'P'
  scores      jsonb,                  -- { "P": n, "F": n, "C": n }
  answers     jsonb                   -- { "q1": 0, "q2": 2, ... }
);

-- 集計用インデックス（タイプ別の分布をすぐ見られるように）
create index if not exists quiz_results_type_idx on public.quiz_results (type);
create index if not exists quiz_results_created_idx on public.quiz_results (created_at);

-- 行レベルセキュリティを有効化。ポリシーを一切作らないことで、
-- 公開キー（anon）からは読み書きできない＝完全に非公開になります。
-- 書き込みは service_role キーを使うサーバー側 API ルートからのみ行います
-- （service_role は RLS をバイパスします）。
alter table public.quiz_results enable row level security;

-- 集計を見るときは Supabase ダッシュボードの Table Editor / SQL Editor から。
-- 例：タイプ別の件数
--   select type, count(*) from public.quiz_results group by type order by count(*) desc;
