import Link from 'next/link';

export default function TopPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#040408',
      fontFamily: "'Noto Sans JP', sans-serif",
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: '#e8b830',
          marginBottom: 16,
          textTransform: 'uppercase' as const,
        }}>
          Trading Card Portfolio
        </p>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: 48,
          background: 'linear-gradient(135deg, #f0d060, #e8b830, #d4a017)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>
          TreBase
        </h1>

        <p style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 48,
        }}>
          トレーディングカードの資産を一元管理。<br />
          eBay相場連動の価格更新で、<br />
          あなたのコレクションの価値を可視化します。
        </p>

        <a
          href="#"
          style={{
            display: 'inline-block',
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #e8b830, #d4a017)',
            color: '#040408',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 12,
            textDecoration: 'none',
            marginBottom: 64,
          }}
        >
          App Storeでダウンロード
        </a>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
        }}>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
            プライバシーポリシー
          </Link>
          <span>·</span>
          <a href="mailto:trebase.app@gmail.com" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
            お問い合わせ
          </a>
          <span>·</span>
          <span>© 2026 TreBase</span>
        </div>
      </div>
    </div>
  );
}
