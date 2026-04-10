'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 最初のinputにフォーカス
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // 数字のみ

    const newCode = [...code];
    newCode[index] = value.slice(-1); // 1文字だけ
    setCode(newCode);

    // 次のinputに自動フォーカス
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // 全桁入力されたら自動送信
    if (newCode.every((c) => c !== '') && index === 7) {
      submitCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < 8; i++) {
      newCode[i] = pasted[i] ?? '';
    }
    setCode(newCode);

    if (pasted.length === 8) {
      submitCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const submitCode = async (otp: string) => {
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      setError('認証コードが正しくありません。もう一度入力してください。');
      setCode(['', '', '', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  };

  const handleResend = async () => {
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setError('再送信に失敗しました。時間をおいてお試しください。');
      return;
    }

    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#06060a' }}>
      <div className="noise" />
      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="font-display text-2xl font-[800] gold-text tracking-tight">
            Trecahub
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            トレカ投資・資産管理
          </p>
        </div>

        <div className="panel p-6 space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-[600]" style={{ color: 'rgba(255,255,255,0.8)' }}>
              認証コードを入力
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'rgba(232,184,48,0.8)' }}>{email}</span>
              <br />に送信された6桁のコードを入力してください
            </p>
          </div>

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
            >
              {error}
            </p>
          )}

          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="fi text-center font-display font-[700] text-xl"
                style={{
                  width: 38,
                  height: 48,
                  padding: 0,
                  caretColor: '#e8b830',
                }}
                disabled={loading}
              />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center">
              <span className="spinner" />
            </div>
          )}

          <div className="text-center space-y-2">
            {resent ? (
              <p className="text-xs" style={{ color: '#4ade80' }}>
                認証コードを再送信しました
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-xs transition-colors"
                style={{ color: 'rgba(232,184,48,0.6)' }}
                disabled={loading}
              >
                コードが届かない場合は再送信
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
