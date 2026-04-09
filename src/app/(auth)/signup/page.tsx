'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // メール認証コード入力画面へ遷移
    router.push(`/verify?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#06060a' }}>
      <div className="noise" />
      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="font-display text-2xl font-[800] gold-text tracking-tight">
            TCGVault
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            トレカ投資・資産管理
          </p>
        </div>

        <form onSubmit={handleSignup} className="panel" style={{ padding: '32px 28px' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 600, marginBottom: 28 }}>
            新規登録
          </h2>

          {error && (
            <p
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 8, padding: '8px 12px', fontSize: 14, marginBottom: 24 }}
            >
              {error}
            </p>
          )}

          <div style={{ marginBottom: 24 }}>
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

          <div style={{ marginBottom: 24 }}>
            <label className="field-label">パスワード（6文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="fi"
              placeholder="••••••"
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="field-label">パスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="fi"
              placeholder="••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-add" style={{ padding: '12px 24px', width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : null}
            {loading ? '送信中...' : '認証メールを送信'}
          </button>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            既にアカウントがある場合は{' '}
            <Link href="/login" style={{ color: '#e8b830' }}>
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
