import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー - TreBase',
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#040408', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="font-display font-[800] gold-text" style={{ fontSize: 18, letterSpacing: '-0.02em' }}>
            TreBase
          </Link>
          <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            TOPに戻る
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: '#e8b830', marginBottom: 12, textTransform: 'uppercase' as const }}>
            Privacy Policy
          </p>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 32, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
            プライバシーポリシー
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            最終更新日: 2026年5月31日
          </p>
        </div>

        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <p style={bodyStyle}>
            TreBase（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、本アプリが収集・使用するデータについて説明します。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <div style={cardStyle}>
            <SectionHeader num="01" title="収集するデータ" />
            <ul style={listStyle}>
              <li style={listItemStyle}><span style={hlStyle}>メールアドレス</span> — アカウント登録・認証に使用します。</li>
              <li style={listItemStyle}><span style={hlStyle}>カード登録情報</span> — カード名、価格、鑑定情報、数量など、ユーザーが入力したポートフォリオデータ。</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="02" title="データの使用目的" />
            <ul style={listStyle}>
              <li style={listItemStyle}>アカウントの作成・認証</li>
              <li style={listItemStyle}>ポートフォリオ管理機能の提供</li>
              <li style={listItemStyle}>カード価格の取得・更新</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="03" title="第三者サービス" />
            <p style={{ ...bodyStyle, marginBottom: 16 }}>
              本アプリは以下の第三者サービスを利用しています。ユーザーの個人情報（メールアドレス等）をこれらのサービスに送信することはありません。
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}><span style={hlStyle}>Supabase</span> — データベース・認証基盤として使用。</li>
              <li style={listItemStyle}><span style={hlStyle}>eBay API</span> — カード価格の取得に使用。検索クエリのみ送信し、個人情報は含まれません。</li>
              <li style={listItemStyle}><span style={hlStyle}>Cloudflare R2</span> — カード画像の配信に使用。</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="04" title="データの保存" />
            <p style={bodyStyle}>
              ユーザーのデータはSupabase（クラウド）に保存されます。適切なアクセス制御により、本人のデータのみアクセス可能です。
            </p>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="05" title="Cookie・トラッキング" />
            <p style={bodyStyle}>
              本アプリはCookieやトラッキングツールを使用しません。
            </p>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="06" title="サブスクリプション" />
            <p style={{ ...bodyStyle, marginBottom: 16 }}>
              本アプリでは、追加機能を利用できる有料プラン「TreBase Pro」を提供しています。
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}><span style={hlStyle}>料金</span> — 月額プラン ¥500 / 年額プラン ¥5,000</li>
              <li style={listItemStyle}><span style={hlStyle}>課金方法</span> — お支払いはApple IDに紐づくアカウントに請求されます。</li>
              <li style={listItemStyle}><span style={hlStyle}>自動更新</span> — サブスクリプションは期間終了日の24時間前までにキャンセルされない限り自動更新されます。更新料金は期間終了前24時間以内に請求されます。</li>
              <li style={listItemStyle}><span style={hlStyle}>管理・解約</span> — サブスクリプションの管理・キャンセルは、購入後にApp Storeのアカウント設定から行えます。</li>
              <li style={listItemStyle}><span style={hlStyle}>無料トライアル</span> — 無料トライアル期間が提供されている場合、未使用分はサブスクリプション購入時に失効します。</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="07" title="データの削除" />
            <p style={bodyStyle}>
              アカウントを削除すると、関連するすべてのデータが削除されます。削除をご希望の場合は、下記の連絡先までお問い合わせください。
            </p>
          </div>

          <div style={cardStyle}>
            <SectionHeader num="08" title="お問い合わせ" />
            <p style={bodyStyle}>
              プライバシーに関するご質問は、以下のメールアドレスまでお問い合わせください。
            </p>
            <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: '#e8b830' }}>
              gnr.khei@gmail.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12, color: '#e8b830', opacity: 0.5 }}>{num}</span>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{title}</h2>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: 32,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.8,
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const listItemStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 2.2,
  color: 'rgba(255,255,255,0.4)',
  paddingLeft: 16,
  position: 'relative' as const,
};

const hlStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontWeight: 600,
};
