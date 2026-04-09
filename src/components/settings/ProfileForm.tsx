'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@iconify/react';

interface Props {
  email: string;
  createdAt: string;
  cardCount: number;
}

export default function ProfileForm({ email, createdAt }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initial = email.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    // Account deletion would require a server action or API route
    setShowDeleteModal(false);
  };

  return (
    <div className="max-w-[720px] mx-auto" style={{ paddingTop: '8px' }}>
      {/* Header */}
      <div className="mb-6 fade" style={{ marginTop: '8px' }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:cog-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">Settings</span>
        </div>
        <h1 className="font-bold text-xl md:text-2xl tracking-tight text-white/85">プロフィール設定</h1>
      </div>

      {/* Profile Section */}
      <section className="mb-8 fade fd1">
        <div className="section-title">
          <span className="st-icon" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.12)' }}>
            <Icon icon="mdi:account-outline" width={15} className="text-[#e8b830]" />
          </span>
          プロフィール
        </div>
        <div className="flex items-start gap-5 mb-6">
          <div className="avatar-large">
            {initial}
            <div className="avatar-edit">
              <Icon icon="mdi:camera-outline" width={12} />
            </div>
          </div>
          <div className="flex-1 pt-1">
            <div className="text-[11px] text-white/30 mb-0.5">表示名</div>
            <div className="text-base font-medium text-white/70">{email.split('@')[0]}</div>
            <div className="text-[10px] text-white/15 mt-1">クリックでアバター画像を変更</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label className="field-label">表示名</label>
            <input type="text" className="fi" defaultValue={email.split('@')[0]} />
          </div>
          <div>
            <label className="field-label">メールアドレス</label>
            <input type="email" className="fi" value={email} readOnly />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10 fade fd2">
        <button type="button" className="btn-ghost-app" style={{ color: 'rgba(255,255,255,0.3)' }} onClick={handleLogout}>
          <Icon icon="mdi:logout" width={15} />
          ログアウト
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mb-10 fade fd3">
        <div style={{ borderTop: '1px solid rgba(239,68,68,0.1)', paddingTop: '20px', marginTop: '8px' }}>
          <div className="text-[11px] font-medium text-red-400/50 mb-2 flex items-center gap-2">
            <Icon icon="mdi:alert-outline" width={13} />
            危険な操作
          </div>
          <p className="text-[11px] text-white/15 mb-3">アカウントを削除すると、すべてのデータが永久に失われます。</p>
          <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)}>
            <Icon icon="mdi:trash-can-outline" width={14} className="mr-1" />
            アカウントを削除
          </button>
        </div>
      </div>

      <div className="h-10" />

      {/* Delete Account Modal */}
      <div className={`modal-overlay ${showDeleteModal ? 'open' : ''}`} onClick={() => setShowDeleteModal(false)}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:alert-circle-outline" width={20} className="text-red-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white/70">アカウントを削除しますか？</div>
              <div className="text-[11px] text-white/25 mt-0.5">この操作は取り消せません</div>
            </div>
          </div>
          <div className="text-[11px] text-white/30 mb-5 leading-relaxed">
            すべてのカードデータ・経費記録・レポートが永久に削除されます。削除後の復元はできません。
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="btn-ghost-app" onClick={() => setShowDeleteModal(false)}>キャンセル</button>
            <button type="button" className="btn-danger" onClick={handleDeleteAccount}>アカウントを削除</button>
          </div>
        </div>
      </div>
    </div>
  );
}
