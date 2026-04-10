'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from('inquiries')
      .insert({ name, email, category, message });

    if (insertError) {
      setError('送信に失敗しました。時間をおいて再度お試しください。');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ background: '#06060a', minHeight: '100vh' }}>
      <div className="noise" />
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="font-display font-[800] text-lg tracking-tight gold-text">Trecahub</Link>
          <Link href="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>TOPに戻る</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }} className="relative z-10">
        <h1 className="font-display font-[700] text-2xl" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>お問い合わせ</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 32 }}>
          ご質問・ご要望・不具合のご報告など、お気軽にお問い合わせください。
        </p>

        {sent ? (
          <div className="panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#10003;</div>
            <h2 className="font-display font-[600] text-lg" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
              送信完了
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}>
              お問い合わせを受け付けました。<br />
              内容を確認の上、ご返信いたします。
            </p>
            <Link
              href="/"
              className="btn-add"
              style={{ display: 'inline-flex', marginTop: 24, padding: '10px 24px' }}
            >
              TOPに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="panel" style={{ padding: '28px 24px' }}>
            {error && (
              <p
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#f87171',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                {error}
              </p>
            )}

            <div style={{ marginBottom: 18 }}>
              <label className="field-label">お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="fi"
                placeholder="山田 太郎"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="field-label">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="fi"
                placeholder="mail@example.com"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="field-label">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="fi"
              >
                <option value="general">一般的なお問い合わせ</option>
                <option value="bug">不具合の報告</option>
                <option value="feature">機能のリクエスト</option>
                <option value="account">アカウントについて</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="field-label">お問い合わせ内容</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="fi"
                rows={6}
                placeholder="お問い合わせ内容をご記入ください"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-add"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 24px' }}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? '送信中...' : '送信する'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
