# PFC診断アプリ（Next.js + Supabase + Vercel）

公式LINE内ではなく Web アプリとして動く「摂りすぎ栄養素」PFC診断です。
広告キャッチ画像 → このLP（＝診断） → 結果画面のボタンから公式LINE、という動線を想定しています。
結果は3タイプ（糖質オーバー型 / 脂質オーバー型 / たんぱく質オーバー型）に分岐し、
最後に「3日間レポート」への橋わたし＋公式LINEへのCTAを表示します。

## 使っているもの

- **Next.js（App Router）+ TypeScript** … アプリ本体
- **Tailwind CSS** … スタイリング（Next.js標準構成）
- **Supabase** … 回答結果の保存（任意。未設定でもアプリは動きます）
- **Vercel** … ホスティング

チャートは外部ライブラリを使わず自前のSVG/CSSで描いているため、依存は最小限です。

---

## ローカルで動かす

```bash
npm install
cp .env.example .env.local   # 値を埋める（後述。空でも起動はします）
npm run dev                  # http://localhost:3000
```

---

## 環境変数（.env.local）

| 変数 | 必須 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_LINE_URL` | 結果ボタンに必要 | 公式LINEの友だち追加URL（例 `https://lin.ee/xxxx`） |
| `NEXT_PUBLIC_SAMPLE_REPORT_URL` | 任意 | サンプルレポート画像のURL。設定すると結果画面に表示 |
| `SUPABASE_URL` | 保存する場合 | Supabaseのプロジェクトリンク |
| `SUPABASE_SERVICE_ROLE_KEY` | 保存する場合 | service_roleキー（**秘密**。サーバー側のみ） |

> `SUPABASE_*` を空のままにすると、回答は保存されませんがアプリは正常に動きます。
> まず動きを確認 → あとからSupabaseを繋ぐ、という順でOKです。

---

## Supabase をつなぐ（回答を保存したい場合）

1. [supabase.com](https://supabase.com) でプロジェクトを作成。
2. ダッシュボードの **SQL Editor** で `supabase/schema.sql` を貼り付けて実行。
3. **Project Settings → API** から `Project URL` と `service_role` キーをコピーし、
   それぞれ `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` に設定。

集計はダッシュボードのSQL Editorから。例：

```sql
select type, count(*) from public.quiz_results group by type order by count desc;
```

> セキュリティ設計：テーブルはRLS有効＋ポリシー無し＝公開キーからは読み書き不可。
> 書き込みは service_role を使うサーバー側APIルート（`/api/submit`）からのみ行います。
> service_role キーはブラウザに出ません（`NEXT_PUBLIC_` を付けないこと）。

---

## Vercel にデプロイ

1. このフォルダを GitHub リポジトリに push。
2. [vercel.com](https://vercel.com) で「New Project」→ そのリポジトリを選択。
3. **Environment Variables** に上記の変数を登録（`.env.local` と同じ内容）。
4. Deploy。Next.js は自動検出されるので設定変更は不要です。

独自ドメインを使う場合は Vercel の Project → Domains から追加できます。

---

## 中身をいじるとき

| やりたいこと | 触るファイル |
|---|---|
| 質問・選択肢・加点を変える | `src/lib/questions.ts` |
| 判定ロジック（同点処理など） | `src/lib/scoring.ts` |
| 結果の文章・タイプ名・色 | `src/lib/results.ts` |
| 画面の見た目・文言・ボタン | `src/components/Quiz.tsx` |
| 配色・フォント | `tailwind.config.ts` / `src/app/layout.tsx` |

質問を10問→8問にしたい場合は、`questions.ts` で `optional: true` の質問（q6・q10）を
配列から削除するだけで判定は成立します。

> 結果コピーの方針：C型・F型は「過多の栄養素＝触る場所は1つ」を軸に。
> P型のみ「減らすの逆＝正しく足す」方向。数値（kcal・g）は出さず、傾向のみ提示します。
> 正確な数値は3日間レポート（上位版）で扱う、という導線を崩さない設計です。
