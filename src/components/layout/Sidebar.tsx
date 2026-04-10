'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  group: 'main' | 'manage' | 'settings';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: 'mdi:view-dashboard-outline', group: 'main' },
  { href: '/portfolio', label: 'カード一覧', icon: 'mdi:cards-outline', group: 'main' },
  { href: '/cards/new', label: 'カード登録', icon: 'mdi:card-plus-outline', group: 'main' },
  { href: '/expenses', label: '経費管理', icon: 'mdi:receipt-text-outline', group: 'manage' },
  { href: '/report', label: '年間レポート', icon: 'mdi:file-chart-outline', group: 'manage' },
  { href: '/settings', label: 'プロフィール', icon: 'mdi:cog-outline', group: 'settings' },
];

interface SidebarProps {
  cardCount?: number;
  userInitial?: string;
  userName?: string;
}

export default function Sidebar({ cardCount, userInitial = 'T', userName = '' }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const groups = [
    { key: 'main', label: 'メイン' },
    { key: 'manage', label: '管理' },
    { key: 'settings', label: '設定' },
  ] as const;

  return (
    <>
      <aside className="sidebar" id="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" className="no-underline">
            <span className="font-display font-[800] text-xl tracking-tight gold-text">
              Trecaru
            </span>
          </Link>
          <div className="font-display text-[9px] mt-0.5 tracking-wider" style={{ color: 'rgba(255,255,255,0.1)' }}>
            Portfolio Manager
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="nav-group-label">{group.label}</div>
              {NAV_ITEMS.filter((item) => item.group === group.key).map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? ' active' : ''}`}
                  >
                    <span className="ni">
                      <Icon
                        icon={item.icon}
                        width={17}
                        style={active ? undefined : { opacity: 0.55 }}
                      />
                    </span>
                    {item.label}
                    {item.href === '/portfolio' && cardCount !== undefined && cardCount > 0 && (
                      <span className="nav-badge">{cardCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <Link href="/settings" className="sidebar-user no-underline">
            <div className="user-avatar">{userInitial}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {userName || 'ユーザー'}
              </div>
              <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                無料プラン
              </div>
            </div>
            <Icon icon="mdi:chevron-right" width={14} style={{ color: 'rgba(255,255,255,0.12)' }} />
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div className="sidebar-overlay" id="sidebarOverlay" />
    </>
  );
}
