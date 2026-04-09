'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, PlusCircle, FileBarChart, Receipt } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard },
  { href: '/portfolio', label: '一覧', icon: Wallet },
  { href: '/cards/new', label: '登録', icon: PlusCircle },
  { href: '/expenses', label: '経費', icon: Receipt },
  { href: '/report', label: 'レポート', icon: FileBarChart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card-bg md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                isActive ? 'text-primary font-semibold' : 'text-muted'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
