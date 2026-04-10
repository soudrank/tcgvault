import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | Trecahub',
};

export default function PrivacyPage() {
  return (
    <div style={{ background: '#06060a', minHeight: '100vh' }}>
      <div className="noise" />
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="font-display font-[800] text-lg tracking-tight gold-text">Trecahub</Link>
          <Link href="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>TOPに戻る</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }} className="relative z-10">
        <h1 className="font-display font-[700] text-2xl" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>プライバシーポリシー</h1>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginBottom: 40 }}>最終更新日: 2026年4月8日</p>

        <div className="legal-content">
          <p>
            Trecahub（以下「当サービス」）は、ユーザーの個人情報の保護を重要と考え、
            以下のプライバシーポリシーに従い適切に取り扱います。
          </p>

          <h2>1. 収集する情報</h2>
          <p>当サービスは、以下の情報を収集します。</p>

          <h3>1-1. ユーザーが提供する情報</h3>
          <ul>
            <li>メールアドレス（アカウント登録時）</li>
            <li>パスワード（暗号化して保存）</li>
            <li>お問い合わせ内容（お名前、メールアドレス、メッセージ）</li>
          </ul>

          <h3>1-2. サービス利用に伴い収集する情報</h3>
          <ul>
            <li>トレーディングカードの登録情報（カード名、価格、鑑定情報等）</li>
            <li>eBay等の外部サービスから取得した市場価格データ</li>
            <li>PSA Population Reportから取得した鑑定枚数データ</li>
            <li>経費・取引記録</li>
          </ul>

          <h3>1-3. 自動的に収集する情報</h3>
          <ul>
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
            <li>Cookie情報（認証セッションの維持に使用）</li>
          </ul>

          <h2>2. 情報の利用目的</h2>
          <p>収集した情報は以下の目的で利用します。</p>
          <ul>
            <li>サービスの提供・運営・改善</li>
            <li>ユーザー認証およびアカウント管理</li>
            <li>市場価格の取得・表示</li>
            <li>資産推移・収益分析の算出</li>
            <li>お問い合わせへの対応</li>
            <li>重要なお知らせの通知</li>
            <li>利用規約違反への対応</li>
          </ul>

          <h2>3. 情報の第三者提供</h2>
          <p>当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ul>
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>

          <h2>4. 外部サービスとの連携</h2>
          <p>当サービスは以下の外部サービスと連携します。</p>
          <ul>
            <li><strong>Supabase</strong> — データベース・認証基盤として利用。データはSupabase社のサーバーに保存されます。</li>
            <li><strong>eBay API</strong> — 市場価格の参照に利用。ユーザーのカード情報（カード名・鑑定情報）を検索クエリとして送信します。</li>
            <li><strong>PSA API</strong> — 鑑定枚数データの取得に利用。認定番号を送信します。</li>
            <li><strong>Vercel</strong> — ホスティング基盤として利用。</li>
          </ul>

          <h2>5. データの保管とセキュリティ</h2>
          <ul>
            <li>パスワードは暗号化（ハッシュ化）して保存します。</li>
            <li>データベースへのアクセスはRow Level Security（RLS）により保護されています。</li>
            <li>通信はSSL/TLSにより暗号化されています。</li>
            <li>ただし、インターネット上の通信において完全なセキュリティを保証するものではありません。</li>
          </ul>

          <h2>6. Cookieの使用</h2>
          <p>
            当サービスは、認証セッションの維持のためにCookieを使用します。
            ブラウザの設定でCookieを無効にした場合、当サービスの一部機能が利用できなくなります。
          </p>

          <h2>7. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します。</p>
          <ul>
            <li>登録情報の閲覧・修正</li>
            <li>アカウントの削除（退会）</li>
            <li>個人情報の利用停止の請求</li>
          </ul>
          <p>これらの請求はお問い合わせフォームよりご連絡ください。</p>

          <h2>8. 未成年の利用</h2>
          <p>
            当サービスは年齢制限を設けていませんが、未成年のユーザーは保護者の同意を得た上でご利用ください。
          </p>

          <h2>9. ポリシーの変更</h2>
          <p>
            当サービスは、必要に応じて本ポリシーを変更することがあります。
            重要な変更がある場合は、サービス上で通知します。
          </p>

          <h2>10. お問い合わせ</h2>
          <p>
            個人情報の取扱いに関するお問い合わせは、
            <Link href="/contact" style={{ color: '#e8b830' }}>お問い合わせフォーム</Link>
            よりご連絡ください。
          </p>
        </div>
      </main>
    </div>
  );
}
