'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValid = password.length >= 6 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-white mb-2">
            パスワードを変更しました
          </h1>
          <p className="text-sm text-white/50">
            アプリに戻ってログインしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-2">
            新しいパスワードを設定
          </h1>
          <p className="text-sm text-white/50 mb-6">
            6文字以上のパスワードを入力してください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full bg-surface-600 text-white rounded-lg px-4 py-3 outline-none border border-white/5 focus:border-gold-400/50 transition-colors"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
                className="w-full bg-surface-600 text-white rounded-lg px-4 py-3 outline-none border border-white/5 focus:border-gold-400/50 transition-colors"
                autoComplete="new-password"
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-sm">パスワードが一致しません</p>
            )}

            {password && password.length < 6 && (
              <p className="text-red-400 text-sm">
                パスワードは6文字以上で入力してください
              </p>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-gold-500 text-black font-bold rounded-lg py-3 disabled:opacity-40 hover:bg-gold-400 transition-colors"
            >
              {isLoading ? '変更中...' : 'パスワードを変更'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
