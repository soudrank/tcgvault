'use client';

import { useEffect, useState } from 'react';

interface Stats {
  today: {
    date: string;
    ebayApiCalls: number;
    cacheHits: number;
    cronCalls: number;
    limit: number;
    remaining: number;
  };
  last7days: {
    date: string;
    ebayApiCalls: number;
    cacheHits: number;
    cronCalls: number;
  }[];
  cache: { total: number; fresh24h: number };
  cards: { total: number; ebayLinked: number; uniqueQueries: number };
  users: number;
  recentCacheUpdates: { query: string; updatedAt: string }[];
  serverTime: string;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchStats(saved);
    }
  }, []);

  async function fetchStats(t?: string) {
    const useToken = t || token;
    if (!useToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/stats?token=${useToken}`);
      if (!res.ok) throw new Error('認証エラー');
      const data = await res.json();
      setStats(data);
      localStorage.setItem('admin_token', useToken);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const usagePercent = stats
    ? Math.round((stats.today.ebayApiCalls / stats.today.limit) * 100)
    : 0;

  return (
    <div style={{ background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh', padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>TreBase Admin</h1>

      {!stats && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="password"
            placeholder="Admin Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStats()}
            style={{ padding: '8px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', flex: 1 }}
          />
          <button
            onClick={() => fetchStats()}
            style={{ padding: '8px 20px', background: '#c8a951', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            ログイン
          </button>
        </div>
      )}

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      {loading && <p>読み込み中...</p>}

      {stats && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#888' }}>サーバー時刻: {new Date(stats.serverTime).toLocaleString('ja-JP')}</span>
            <button
              onClick={() => fetchStats()}
              style={{ padding: '4px 12px', background: '#222', border: '1px solid #444', borderRadius: 6, color: '#c8a951', cursor: 'pointer', fontSize: 12 }}
            >
              更新
            </button>
          </div>

          {/* Today's Usage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <Card title="eBay API (今日)" value={`${stats.today.ebayApiCalls} / ${stats.today.limit}`} sub={`残り ${stats.today.remaining}`} color={usagePercent > 80 ? '#ef4444' : '#c8a951'} />
            <Card title="キャッシュHIT (今日)" value={String(stats.today.cacheHits)} sub="API節約回数" color="#22c55e" />
            <Card title="Cron (今日)" value={String(stats.today.cronCalls)} sub="サーバー側バッチ" color="#3b82f6" />
            <Card title="ユーザー数" value={String(stats.users)} sub={`${stats.cards.total}枚登録`} color="#a855f7" />
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>eBay API 使用量</span>
              <span style={{ fontSize: 13, color: usagePercent > 80 ? '#ef4444' : '#c8a951' }}>{usagePercent}%</span>
            </div>
            <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(usagePercent, 100)}%`, background: usagePercent > 80 ? '#ef4444' : '#c8a951', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Cards & Cache */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#c8a951' }}>カード</h3>
              <Row label="登録カード数" value={String(stats.cards.total)} />
              <Row label="eBayリンク済み" value={String(stats.cards.ebayLinked)} />
              <Row label="ユニーククエリ" value={String(stats.cards.uniqueQueries)} />
            </div>
            <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#c8a951' }}>キャッシュ</h3>
              <Row label="総エントリ" value={String(stats.cache.total)} />
              <Row label="24h以内" value={String(stats.cache.fresh24h)} />
            </div>
          </div>

          {/* 7-day history */}
          <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#c8a951' }}>7日間の履歴</h3>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#888', textAlign: 'left' }}>
                  <th style={{ padding: '6px 0' }}>日付</th>
                  <th>eBay API</th>
                  <th>Cache HIT</th>
                  <th>Cron</th>
                </tr>
              </thead>
              <tbody>
                {stats.last7days?.map((d) => (
                  <tr key={d.date} style={{ borderTop: '1px solid #222' }}>
                    <td style={{ padding: '6px 0' }}>{d.date}</td>
                    <td>{d.ebayApiCalls}</td>
                    <td>{d.cacheHits}</td>
                    <td>{d.cronCalls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent cache updates */}
          <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#c8a951' }}>最新キャッシュ更新</h3>
            {stats.recentCacheUpdates?.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderTop: i > 0 ? '1px solid #222' : 'none' }}>
                <span style={{ color: '#ccc' }}>{e.query}</span>
                <span style={{ color: '#888' }}>{new Date(e.updatedAt).toLocaleString('ja-JP')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
      <span style={{ color: '#aaa' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
