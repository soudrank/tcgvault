'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

export default function SidebarHandler() {
  const pathname = usePathname();

  // オーバーレイクリックで閉じる
  useEffect(() => {
    const overlay = document.getElementById('sidebarOverlay');
    overlay?.addEventListener('click', closeSidebar);
    return () => overlay?.removeEventListener('click', closeSidebar);
  }, []);

  // ページ遷移時に閉じる
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  return null;
}
