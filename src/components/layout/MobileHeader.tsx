'use client';

import { Icon } from '@iconify/react';

export default function MobileHeader() {
  const openSidebar = () => {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebarOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  return (
    <div className="mobile-header">
      <button
        onClick={openSidebar}
        className="p-1 transition-colors"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        <Icon icon="mdi:menu" width={22} />
      </button>
      <a href="/" className="font-display font-[700] text-base tracking-tight gold-text no-underline">
        Trecaru
      </a>
      <div className="flex-1" />
    </div>
  );
}
