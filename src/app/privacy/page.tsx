export const metadata = {
  title: 'プライバシーポリシー - TreBase',
};

export default function PrivacyPage() {
  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '60px 24px',
      color: '#e0e0e0',
      backgroundColor: '#040408',
      minHeight: '100vh',
      fontFamily: "'Noto Sans JP', sans-serif",
      lineHeight: 1.8,
    }}>
      <h1 style={{ color: '#e8b830', fontSize: 28, marginBottom: 8 }}>プライバシーポリシー</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>最終更新日: 2026年5月31日</p>

      <p>TreBase（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、本アプリが収集・使用するデータについて説明します。</p>

      <h2 style={sectionStyle}>1. 収集するデータ</h2>
      <ul style={listStyle}>
        <li><strong>メールアドレス</strong>: アカウント登録・認証に使用します。</li>
        <li><strong>カード登録情報</strong>: カード名、価格、鑑定情報、数量など、ユーザーが入力したポートフォリオデータ。</li>
      </ul>

      <h2 style={sectionStyle}>2. データの使用目的</h2>
      <ul style={listStyle}>
        <li>アカウントの作成・認証</li>
        <li>ポートフォリオ管理機能の提供</li>
        <li>カード価格の取得・更新</li>
      </ul>

      <h2 style={sectionStyle}>3. 第三者サービス</h2>
      <p>本アプリは以下の第三者サービスを利用しています。ユーザーの個人情報（メールアドレス等）をこれらのサービスに送信することはありません。</p>
      <ul style={listStyle}>
        <li><strong>Supabase</strong>: データベース・認証基盤として使用。</li>
        <li><strong>eBay API</strong>: カード価格の取得に使用。検索クエリのみ送信し、個人情報は含まれません。</li>
        <li><strong>Cloudflare R2</strong>: カード画像の配信に使用。</li>
      </ul>

      <h2 style={sectionStyle}>4. データの保存</h2>
      <p>ユーザーのデータはSupabase（クラウド）に保存されます。適切なアクセス制御により、本人のデータのみアクセス可能です。</p>

      <h2 style={sectionStyle}>5. Cookie・トラッキング</h2>
      <p>本アプリはCookieやトラッキングツールを使用しません。</p>

      <h2 style={sectionStyle}>6. データの削除</h2>
      <p>アカウントを削除すると、関連するすべてのデータが削除されます。削除をご希望の場合は、下記の連絡先までお問い合わせください。</p>

      <h2 style={sectionStyle}>7. お問い合わせ</h2>
      <p>プライバシーに関するご質問は、以下のメールアドレスまでお問い合わせください。</p>
      <p style={{ color: '#e8b830' }}>gnr.khei@gmail.com</p>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginTop: 36,
  marginBottom: 12,
  color: '#fff',
};

const listStyle: React.CSSProperties = {
  paddingLeft: 20,
  marginTop: 8,
};
