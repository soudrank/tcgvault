# Project: treca

Stack
– Framework: Next.js 15 (App Router)
– Styling: Tailwind CSS v4
– Language: TypeScript (strict mode)
– Database: Supabase (PostgreSQL)
– Deploy: Vercel

Rules (ALWAYS follow these)
– Never modify files outside the scope I specify.
– Prefer editing existing files over creating new ones.
– Never create README or documentation files unless asked.
– Run `npm run dev` or `npm run build` after every code change.
– Ask before installing any new package.

Code Style
– No default exports (except Next.js page/layout files where it's required)
– Use `interface` instead of `type`
– No inline styles
– No class components (use functional components with hooks)

Supabase Rules
– Use server components or server actions for database access whenever possible
– Never expose service role keys on the client
– Use RLS (Row Level Security) by default
– Use `supabase-js` client correctly depending on environment (server vs client)
– Keep queries simple and readable
– Prefer typed queries using generated types
– Use cookies-based auth with Supabase Auth
– Handle errors explicitly for all database operations
– Never trust client-side data for authorization

Best Practices
– Keep components small and reusable
– Use server components by default unless client is necessary
– Prefer async/await over then/catch
– Use absolute imports (`@/`)

CSS修正ルール

- 既存のCSSクラスを別の要素に流用するな。
  値が1つでも違うなら専用クラスを作れ。
- CSSクラスを付ける前に、そのクラスの定義
  （プロパティ、keyframe、疑似要素すべて）
  を読め。
- inline styleとCSSクラスで同じプロパティ
  を設定するな。どちらか片方に統一しろ。
- 「動いた」ではなく「なぜ動くか」を説明
  できない修正をするな。
