import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー - TreBase',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-body" style={{ background: '#040408' }}>
      <div className="noise" />

      <nav className="relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-[800] text-lg tracking-tight gold-text">
            TreBase
          </Link>
          <Link href="/" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
            TOPに戻る
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#e8b830' }}>
            Privacy Policy
          </p>
          <h1 className="font-display font-[700] text-3xl mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
            プライバシーポリシー
          </h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            最終更新日: 2026年5月31日
          </p>
        </div>

        <div className="rounded-2xl p-8 mb-8" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={bodyStyle}>
            TreBase（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、本アプリが収集・使用するデータについて説明します。
          </p>
        </div>

        <div className="space-y-6">
          <Section num="01" title="収集するデータ">
            <ul style={listStyle}>
              <li><Hl>メールアドレス</Hl> — アカウント登録・認証に使用します。</li>
              <li><Hl>カード登録情報</Hl> — カード名、価格、鑑定情報、数量など、ユーザーが入力したポートフォリオデータ。</li>
            </ul>
          </Section>

          <Section num="02" title="データの使用目的">
            <ul style={listStyle}>
              <li>アカウントの作成・認証</li>
              <li>ポートフォリオ管理機能の提供</li>
              <li>カード価格の取得・更新</li>
            </ul>
          </Section>

          <Section num="03" title="第三者サービス">
            <p style={bodyStyle}>
              本アプリは以下の第三者サービスを利用しています。ユーザーの個人情報（メールアドレス等）をこれらのサービスに送信することはありません。
            </p>
            <ul style={listStyle}>
              <li><Hl>Supabase</Hl> — データベース・認証基盤として使用。</li>
              <li><Hl>eBay API</Hl> — カード価格の取得に使用。検索クエリのみ送信し、個人情報は含まれません。</li>
              <li><Hl>Cloudflare R2</Hl> — カード画像の配信に使用。</li>
            </ul>
          </Section>

          <Section num="04" title="データの保存">
            <p style={bodyStyle}>
              ユーザーのデータはSupabase（クラウド）に保存されます。適切なアクセス制御により、本人のデータのみアクセス可能です。
            </p>
          </Section>

          <Section num="05" title="Cookie・トラッキング">
            <p style={bodyStyle}>
              本アプリはCookieやトラッキングツールを使用しません。
            </p>
          </Section>

          <Section num="06" title="データの削除">
            <p style={bodyStyle}>
              アカウントを削除すると、関連するすべてのデータが削除されます。削除をご希望の場合は、下記の連絡先までお問い合わせください。
            </p>
          </Section>

          <Section num="07" title="お問い合わせ">
            <p style={bodyStyle}>
              プライバシーに関するご質問は、以下のメールアドレスまでお問い合わせください。
            </p>
            <p className="mt-3 text-sm font-medium" style={{ color: '#e8b830' }}>
              gnr.khei@gmail.com
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-8" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-display font-[700] text-xs" style={{ color: '#e8b830', opacity: 0.6 }}>{num}</span>
        <h2 className="font-display font-[700] text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{children}</strong>;
}

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.8,
  color: 'rgba(255,255,255,0.4)',
};

const listStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 2.2,
  color: 'rgba(255,255,255,0.4)',
  paddingLeft: 4,
  listStyle: 'none',
};
