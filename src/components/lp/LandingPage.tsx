'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // アプリ側のサイドバーが設定したoverflow:hiddenをリセット
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  // ログイン状態を確認
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? '' } : null);
    });
  }, []);

  // ユーザーメニュー外クリックで閉じる
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
  };

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 50) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }); },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Smooth scroll for anchor links
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const openMobileMenu = () => { setMobileMenuOpen(true); document.body.style.overflow = 'hidden'; };
  const closeMobileMenu = () => { setMobileMenuOpen(false); document.body.style.overflow = ''; };

  return (
    <>
      <div className="grid-pattern" style={{ backgroundColor: '#06060a', color: '#e8e4dc', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div className="noise-overlay" />

        {/* Background orbs */}
        <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(212,160,23,0.12),transparent 70%)', top: -100, right: -150, animation: 'pulse-glow 8s ease-in-out infinite' }} />
        <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(184,134,11,0.08),transparent 70%)', bottom: '20%', left: -100, animation: 'pulse-glow 10s ease-in-out infinite 2s' }} />
        <div className="bg-orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(212,160,23,0.06),transparent 70%)', top: '50%', right: '10%', animation: 'pulse-glow 7s ease-in-out infinite 4s' }} />

        {/* Mobile Menu */}
        <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
          <button onClick={closeMobileMenu} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
            <span className="iconify" data-icon="mdi:close" data-width="28" />
          </button>
          <a href="#features" onClick={closeMobileMenu}>機能</a>
          <a href="#dashboard" onClick={closeMobileMenu}>ダッシュボード</a>
          <a href="#supported" onClick={closeMobileMenu}>対応カード</a>
          {user === undefined ? null : user ? (
            <>
              <Link href="/dashboard" onClick={closeMobileMenu} className="btn-primary mt-4">ダッシュボードへ</Link>
              <button
                onClick={() => { handleLogout(); closeMobileMenu(); }}
                style={{ marginTop: 12, fontSize: 14, color: 'rgba(248,113,113,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href="/signup" onClick={closeMobileMenu} className="btn-primary mt-4">無料で始める</Link>
          )}
        </div>

        {/* 1. Navbar */}
        <nav ref={navRef} className="nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300">
          <div className="max-w-[1340px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-[800] text-2xl tracking-tight gold-text">TCGVault</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/50 hover:text-white/90 transition-colors">機能</a>
              <a href="#dashboard" className="text-sm text-white/50 hover:text-white/90 transition-colors">ダッシュボード</a>
              <a href="#supported" className="text-sm text-white/50 hover:text-white/90 transition-colors">対応カード</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {user === undefined ? null : user ? (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4a017, #e8b830)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#06060a',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {(user.email ?? '?')[0].toUpperCase()}
                  </button>
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 44,
                      right: 0,
                      width: 200,
                      background: 'rgba(14,14,22,0.96)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '6px 0',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                      zIndex: 100,
                    }}>
                      <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span className="iconify" data-icon="mdi:view-dashboard-outline" data-width="16" />
                        ダッシュボード
                      </Link>
                      <Link
                        href="/settings"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span className="iconify" data-icon="mdi:cog-outline" data-width="16" />
                        設定
                      </Link>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />
                      <button
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'rgba(248,113,113,0.7)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span className="iconify" data-icon="mdi:logout" data-width="16" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost text-sm">ログイン</Link>
                  <Link href="/signup" className="btn-primary text-sm" style={{ padding: '10px 24px' }}>新規登録</Link>
                </>
              )}
            </div>
            <button className="md:hidden text-white/60 hover:text-white transition-colors" onClick={openMobileMenu}>
              <span className="iconify" data-icon="mdi:menu" data-width="26" />
            </button>
          </div>
        </nav>

        {/* 2. Hero Section */}
        <section className="relative min-h-screen flex items-center pt-16">
          <div className="max-w-[1340px] mx-auto px-6 w-full py-10 md:py-0">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
              {/* Left: Copy */}
              <div className="flex-1 max-w-xl lg:max-w-none text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8" style={{ animation: 'slide-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="text-xs font-medium text-gold-300 tracking-wide">2025年リリース ・ 無料で利用可能</span>
                </div>

                <h1 className="font-body font-[700] text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.15] tracking-tight mb-6" style={{ animation: 'slide-up 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
                  トレカ投資の<br />
                  <span className="gold-text">収益を、正確に。</span>
                </h1>
                {/* Mobile only: 3 slabs between h1 and description */}
                <div className="lp-mobile-slabs relative justify-center" style={{ animation: 'slide-up 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) both', marginTop: '3.5rem', marginBottom: '2rem' }}>
                  {/* Left slab — behind */}
                  <div className="card-slab absolute z-0" style={{ width: 120, left: '3%', top: 20, opacity: 0.4, transform: 'rotate(-6deg)' }}>
                    <div className="card-slab-inner">
                      <div className="relative">
                        <div className="aspect-[2.5/3.5] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #2a1a2a 0%, #180d28 40%, #201630 100%)' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }}>
                              <span className="iconify" data-icon="mdi:sword-cross" data-width="18" style={{ color: '#c084fc' }} />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                            <div className="text-[8px] text-white/40 font-medium tracking-wider uppercase">Secret Rare</div>
                            <div className="text-[10px] font-bold text-white/90 mt-0.5">青眼の白龍</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-2 py-1.5 flex items-center justify-between border-t" style={{ borderColor: 'rgba(168,85,247,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                        <div>
                          <div className="text-[7px] text-white/30 tracking-widest uppercase font-display font-[500]">BGS</div>
                          <div className="text-base font-display font-[800] leading-none mt-0.5" style={{ color: '#c084fc' }}>9.5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right slab — behind */}
                  <div className="card-slab absolute z-0" style={{ width: 140, right: '3%', top: 35, opacity: 0.3, transform: 'rotate(5deg)' }}>
                    <div className="card-slab-inner">
                      <div className="aspect-[2.5/3.5]" style={{ background: 'linear-gradient(160deg, #2a1a1a 0%, #1a0d18 40%, #201620 100%)' }} />
                    </div>
                  </div>
                  {/* Main slab — center front */}
                  <div className="card-slab lp-main-slab relative z-10 w-[180px]">
                    <div className="card-slab-inner">
                      <div className="relative">
                        <div className="aspect-[2.5/3.5] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a3a2a 0%, #0d2818 40%, #162030 100%)' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <div className="w-20 h-20 rounded-full border border-gold-500/30 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)' }}>
                                <div className="w-12 h-12 rounded-full border border-gold-400/40 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.2) 0%, transparent 70%)' }}>
                                  <span className="iconify text-gold-400" data-icon="mdi:lightning-bolt" data-width="22" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                            <div className="text-[9px] text-white/40 font-medium tracking-wider uppercase">Illustration Rare</div>
                            <div className="text-xs font-bold text-white/90 mt-0.5">ピカチュウ VMAX</div>
                          </div>
                          <div className="absolute inset-0 animate-shimmer" />
                        </div>
                      </div>
                      <div className="px-2.5 py-2 flex items-center justify-between border-t border-gold-500/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div>
                          <div className="text-[8px] text-white/30 tracking-widest uppercase font-display font-[500]">PSA</div>
                          <div className="text-xl font-display font-[800] gold-text leading-none mt-0.5">10</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] text-white/25 tracking-wider">POP REPORT</div>
                          <div className="text-[11px] text-white/50 font-medium">47 / 12,840</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-base md:text-lg text-white/45 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0" style={{ animation: 'slide-up 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
                  購入価格・送料・評価費・手数料をすべて自動計算。あらゆるトレーディングカードに対応した本格的なポートフォリオ管理ツールです。
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start" style={{ animation: 'slide-up 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                  <Link href="/signup" className="btn-primary">
                    無料で始める
                    <span className="iconify" data-icon="mdi:arrow-right" data-width="18" />
                  </Link>
                  <button className="btn-ghost">
                    <span className="iconify text-white/40" data-icon="mdi:play-circle-outline" data-width="20" />
                    デモを見る
                  </button>
                </div>
                <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start" style={{ animation: 'slide-up 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-500 border-2 border-surface-900 flex items-center justify-center text-[10px] font-bold text-gold-400">T</div>
                    <div className="w-8 h-8 rounded-full bg-surface-500 border-2 border-surface-900 flex items-center justify-center text-[10px] font-bold text-gold-400">K</div>
                    <div className="w-8 h-8 rounded-full bg-surface-500 border-2 border-surface-900 flex items-center justify-center text-[10px] font-bold text-gold-400">S</div>
                    <div className="w-8 h-8 rounded-full bg-surface-600 border-2 border-surface-900 flex items-center justify-center text-[10px] font-medium text-white/40">+</div>
                  </div>
                  <span className="text-xs text-white/30">β版ユーザー <span className="text-white/50 font-medium">1,200人+</span> が利用中</span>
                </div>
              </div>

              {/* Right: Card Slab Visual (desktop only) */}
              <div className="flex-shrink-0 relative hidden lg:block" style={{ animation: 'slide-up 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="card-slab lp-main-slab relative z-10" style={{ width: 280, marginTop: '-11rem' }}>
                  <div className="card-slab-inner">
                    <div className="relative">
                      <div className="aspect-[2.5/3.5] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a3a2a 0%, #0d2818 40%, #162030 100%)' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-28 h-28 rounded-full border border-gold-500/30 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)' }}>
                              <div className="w-16 h-16 rounded-full border border-gold-400/40 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.2) 0%, transparent 70%)' }}>
                                <span className="iconify text-gold-400" data-icon="mdi:lightning-bolt" data-width="28" />
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-3 w-2 h-2 bg-gold-300 rounded-full" style={{ animation: 'pulse-glow 2s infinite' }} />
                            <div className="absolute top-6 -left-4 w-1.5 h-1.5 bg-gold-400 rounded-full" style={{ animation: 'pulse-glow 2s infinite 0.5s' }} />
                            <div className="absolute -bottom-1 right-2 w-1 h-1 bg-white/60 rounded-full" style={{ animation: 'pulse-glow 2s infinite 1s' }} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                          <div className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Illustration Rare</div>
                          <div className="text-sm font-bold text-white/90 mt-0.5">ピカチュウ VMAX</div>
                        </div>
                        <div className="absolute inset-0 animate-shimmer" />
                      </div>
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between border-t border-gold-500/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div>
                        <div className="text-[9px] text-white/30 tracking-widest uppercase font-display font-[500]">PSA</div>
                        <div className="text-2xl font-display font-[800] gold-text leading-none mt-0.5">10</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-white/25 tracking-wider">POP REPORT</div>
                        <div className="text-xs text-white/50 font-medium">47 / 12,840</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Third slab — left behind */}
                <div className="card-slab lp-third-slab hidden lg:block" style={{ width: 230, position: 'absolute', left: '-22rem', top: '2rem', zIndex: 5, opacity: 0.5 }}>
                  <div className="card-slab-inner">
                    <div className="relative">
                      <div className="aspect-[2.5/3.5] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #2a1a2a 0%, #180d28 40%, #201630 100%)' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-28 h-28 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }}>
                              <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(168,85,247,0.4)', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }}>
                                <span className="iconify" data-icon="mdi:sword-cross" data-width="28" style={{ color: '#c084fc' }} />
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-3 w-2 h-2 rounded-full" style={{ background: '#c084fc', animation: 'pulse-glow 2s infinite' }} />
                            <div className="absolute top-6 -left-4 w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa', animation: 'pulse-glow 2s infinite 0.5s' }} />
                            <div className="absolute -bottom-1 right-2 w-1 h-1 bg-white/60 rounded-full" style={{ animation: 'pulse-glow 2s infinite 1s' }} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                          <div className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Secret Rare</div>
                          <div className="text-sm font-bold text-white/90 mt-0.5">青眼の白龍</div>
                        </div>
                        <div className="absolute inset-0 animate-shimmer-delayed" />
                      </div>
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between border-t" style={{ borderColor: 'rgba(168,85,247,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                      <div>
                        <div className="text-[9px] text-white/30 tracking-widest uppercase font-display font-[500]">BGS</div>
                        <div className="text-2xl font-display font-[800] leading-none mt-0.5" style={{ color: '#c084fc' }}>9.5</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-white/25 tracking-wider">POP REPORT</div>
                        <div className="text-xs text-white/50 font-medium">12 / 4,280</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary slab behind */}
                <div className="card-slab lp-secondary-slab hidden lg:block" style={{ width: 220, position: 'absolute', left: '-3rem', top: '24rem', zIndex: 0, opacity: 0.4 }}>
                  <div className="card-slab-inner">
                    <div className="aspect-[2.5/3.5]" style={{ background: 'linear-gradient(160deg, #2a1a1a 0%, #1a0d18 40%, #201620 100%)' }} />
                  </div>
                </div>
                {/* Floating stats */}
                <div className="absolute -right-8 top-8 z-20 bg-surface-600/90 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 shadow-2xl hidden lg:block" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="iconify text-green-400" data-icon="mdi:trending-up" data-width="14" />
                    <span className="text-[10px] text-green-400 font-medium">+32.4%</span>
                  </div>
                  <div className="text-sm font-bold text-white/90 font-display">¥148,000</div>
                </div>
                <div className="absolute -left-1 bottom-[-17rem] z-20 bg-surface-600/90 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 shadow-2xl hidden lg:block" style={{ animation: 'float 4.5s ease-in-out infinite 2s' }}>
                  <div className="text-[10px] text-white/30 mb-1">評価費込み利益</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-400 font-display">+¥42,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Scroll indicator */}
          {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Scroll</span>
            <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/40 rounded-full" style={{ animation: 'float 2s ease-in-out infinite' }} />
            </div>
          </div> */}
        </section>

        {/* 3. Features Section */}
        <section id="features" className="relative pt-20 pb-10 md:py-36">
          <div className="max-w-[1340px] mx-auto px-6">
            <div className="text-center mb-6 lg:mb-16 reveal">
              <span className="text-xs font-medium text-gold-400 tracking-widest uppercase mb-4 block">Features</span>
              <h2 className="font-body font-[700] text-3xl md:text-4xl tracking-tight mb-4">投資の全体像を<span className='block'><span className="gold-text">可視化</span>する</span></h2>
              <p className="text-white/35 max-w-md mx-auto text-sm leading-relaxed">購入から売却まで、トレカ投資に必要なあらゆるデータを一元管理します。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Feature 1 */}
              <div className="feature-card reveal" style={{ transitionDelay: '0.05s' }}>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-5">
                  <span className="iconify text-gold-400" data-icon="mdi:calculator-variant" data-width="24" />
                </div>
                <h3 className="font-body font-[600] text-lg mb-2 text-white/90">正確な利益計算</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-5">購入価格・送料・評価機関の手数料・プラットフォーム手数料・出品手数料をすべて含めたリアルな利益を自動算出。見落としがちなコストも漏らしません。</p>
                <div className="bg-surface-900/60 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-white/30">内訳例</span>
                    <span className="text-green-400 font-medium">利益 +¥42,800</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-gold-400" /><span className="text-xs text-white/40 flex-1">購入額</span><span className="text-xs text-white/60">¥80,000</span></div>
                    <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /><span className="text-xs text-white/40 flex-1">送料</span><span className="text-xs text-white/60">¥800</span></div>
                    <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /><span className="text-xs text-white/40 flex-1">PSA評価費</span><span className="text-xs text-white/60">¥5,500</span></div>
                    <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /><span className="text-xs text-white/40 flex-1">メルカリ手数料</span><span className="text-xs text-white/60">-¥19,100</span></div>
                    <div className="border-t border-white/5 pt-2 flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-xs text-white/50 flex-1 font-medium">売却額</span><span className="text-xs text-white/80 font-medium">¥148,000</span></div>
                  </div>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="feature-card reveal" style={{ transitionDelay: '0.15s' }}>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-5">
                  <span className="iconify text-gold-400" data-icon="mdi:chart-box-outline" data-width="24" />
                </div>
                <h3 className="font-body font-[600] text-lg mb-2 text-white/90">eBayの落札価格から資産を自動算出</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-5">相場変動をリアルタイムで反映し、最適な売却タイミングを見極めます。</p>
                <div className="bg-surface-900/60 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-white/30">資産推移</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-0.5 rounded-full" style={{ background: '#60a5fa' }} />
                      <span className="text-[9px] text-white/25">eBay落札価格</span>
                    </div>
                  </div>
                  {/* Mock area chart */}
                  <div className="relative h-24">
                    <svg viewBox="0 0 240 80" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lp-grad-blue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,65 Q40,60 80,45 T160,25 T240,15" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
                      <path d="M0,65 Q40,60 80,45 T160,25 T240,15 V80 H0 Z" fill="url(#lp-grad-blue)" />
                      <circle cx="0" cy="65" r="2" fill="#60a5fa" opacity="0.5" />
                      <circle cx="80" cy="45" r="2.5" fill="#60a5fa" />
                      <circle cx="160" cy="25" r="2.5" fill="#60a5fa" />
                      <circle cx="240" cy="15" r="2" fill="#60a5fa" opacity="0.5" />
                    </svg>
                    {/* Tooltip mock */}
                    <div className="absolute right-2 top-1 rounded-lg px-4 py-2.5 border border-white/5" style={{ background: 'rgba(10,10,18,0.9)', fontSize: 10 }}>
                      <div className="text-white/40 mb-0.5">4月</div>
                      <div style={{ color: '#60a5fa' }}>¥2,140,000</div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    {['1月', '2月', '3月', '4月', '5月', '6月'].map((m) => (
                      <span key={m} className="text-[8px] text-white/15">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="feature-card reveal" style={{ transitionDelay: '0.25s' }}>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-5">
                  <span className="iconify text-gold-400" data-icon="mdi:file-document-edit-outline" data-width="24" />
                </div>
                <h3 className="font-body font-[600] text-lg mb-2 text-white/90">確定申告サポート</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-5">年間の損益レポートをワンクリックで生成。確定申告に必要なCSV形式でエクスポートでき、会計ソフトへの入力工数を大幅に削減します。</p>
                <div className="bg-surface-900/60 rounded-xl p-4 border border-white/5 font-mono">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="iconify text-white/20" data-icon="mdi:file-delimited" data-width="14" />
                    <span className="text-[10px] text-white/30">tcgvault_report_2025.csv</span>
                  </div>
                  <div className="space-y-1 text-[10px] leading-relaxed">
                    <div className="text-gold-400/60">日付,カード名,購入額,売却額,利益</div>
                    <div className="text-white/25">2025/01/15,ピカチュウVMAX,80000,128000,48000</div>
                    <div className="text-white/25">2025/02/03,青眼の白龍,45000,38000,-7000</div>
                    <div className="text-white/25">2025/03/20,ルフィSR,12000,18500,6500</div>
                    <div className="text-white/15">...</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2">
                    <span className="iconify text-green-400/60" data-icon="mdi:check-circle" data-width="12" />
                    <span className="text-[10px] text-green-400/60">確定申告書類にそのまま利用可能</span>
                  </div>
                </div>
              </div>
              {/* Feature 4 */}
              <div className="feature-card reveal" style={{ transitionDelay: '0.35s' }}>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-5">
                  <span className="iconify text-gold-400" data-icon="mdi:certificate-outline" data-width="24" />
                </div>
                <h3 className="font-body font-[600] text-lg mb-2 text-white/90">評価カード管理</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-5">PSA・BGS・CGC・ARSの4大評価機関に対応。グレード別に整理され、PSA Population Reportとの連携で希少性も即座に確認できます。</p>
                <div className="bg-surface-900/60 rounded-xl border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 p-4">
                    {/* PSA */}
                    <div className="grading-card" style={{ padding: '12px 14px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-white/20 tracking-widest uppercase font-display font-[600]">PSA</span>
                        <div className="w-4 h-4 rounded bg-green-500/[0.08] border border-green-500/[0.12] flex items-center justify-center">
                          <span className="iconify text-green-400/50" data-icon="mdi:check" data-width="8" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <div className="grading-badge grading-badge-psa" style={{ fontSize: 16, width: 36, height: 36, border: '1px solid rgba(212,160,23,0.15)' }}>10</div>
                        <div>
                          <div className="text-[9px] text-white/20">最高グレード</div>
                          <div className="text-sm font-display font-[700] text-white/70 leading-none">7<span className="text-[9px] text-white/20 font-normal ml-0.5">枚</span></div>
                        </div>
                      </div>
                      <div className="grade-bar" style={{ height: 3 }}><div className="grade-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#b8860b,#f0d060)' }} /></div>
                    </div>
                    {/* BGS */}
                    <div className="grading-card" style={{ padding: '12px 14px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-white/20 tracking-widest uppercase font-display font-[600]">BGS</span>
                        <div className="w-4 h-4 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                          <span className="text-[7px] text-white/20 font-display">—</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <div className="grading-badge" style={{ fontSize: 16, width: 36, height: 36, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>9.5</div>
                        <div>
                          <div className="text-[9px] text-white/20">最高グレード</div>
                          <div className="text-sm font-display font-[700] text-white/70 leading-none">2<span className="text-[9px] text-white/20 font-normal ml-0.5">枚</span></div>
                        </div>
                      </div>
                      <div className="grade-bar" style={{ height: 3 }}><div className="grade-bar-fill" style={{ width: '28.6%', background: 'rgba(255,255,255,0.2)' }} /></div>
                    </div>
                  </div>
                  <div className="px-4 border-t border-white/[0.04] flex items-center gap-2" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
                    <span className="iconify text-green-400/50" data-icon="mdi:database-check-outline" data-width="12" />
                    <span className="text-[10px] text-green-400/50">PSA Pop. Report連携済み</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Dashboard Preview */}
        <section id="dashboard" className="relative py-20 md:py-36">
          <div className="max-w-[1340px] mx-auto px-6">
            <div className="text-center mb-6 lg:mb-14 reveal">
              <span className="text-xs font-medium text-gold-400 tracking-widest uppercase mb-4 block">Dashboard</span>
              <h2 className="font-body font-[700] text-3xl md:text-4xl tracking-tight mb-4">実際の<span className="gold-text">ダッシュボード</span></h2>
              <p className="text-white/35 max-w-md mx-auto text-sm leading-relaxed">すべての情報が一画面に集約。直感的な操作で投資状況を把握できます。</p>
            </div>
            <div className="dashboard-mock reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-white/10" /><div className="w-3 h-3 rounded-full bg-white/10" /><div className="w-3 h-3 rounded-full bg-white/10" /></div>
                  <span className="text-[11px] text-white/20 font-display ml-2">app.tcgvault.jp/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-500 border border-white/10 flex items-center justify-center"><span className="iconify text-white/30" data-icon="mdi:bell-outline" data-width="12" /></div>
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center"><span className="text-[8px] font-bold text-gold-400">T</span></div>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-surface-800/50 rounded-xl p-4 border border-white/5"><div className="text-[10px] text-white/25 mb-1.5">総資産額</div><div className="text-xl font-display font-[700] text-white/85">¥1,284,000</div><div className="flex items-center gap-1.5 mt-2"><span className="iconify text-green-400/60" data-icon="mdi:arrow-up" data-width="10" /><span className="text-[10px] text-green-400/60">+12.3%</span></div></div>
                  <div className="bg-surface-800/50 rounded-xl p-4 border border-white/5"><div className="text-[10px] text-white/25 mb-1.5">総投資額</div><div className="text-xl font-display font-[700] text-white/85">¥955,500</div><div className="flex items-center gap-1.5 mt-2"><span className="text-[10px] text-white/15">67枚のカード</span></div></div>
                  <div className="bg-surface-800/50 rounded-xl p-4 border border-white/5"><div className="text-[10px] text-white/25 mb-1.5">想定利益</div><div className="text-xl font-display font-[700] text-green-400">+¥328,500</div><div className="flex items-center gap-1.5 mt-2"><span className="iconify text-white/15" data-icon="mdi:cards-outline" data-width="10" /><span className="text-[10px] text-white/15">売却時想定</span></div></div>
                  <div className="bg-surface-800/50 rounded-xl p-4 border border-white/5"><div className="text-[10px] text-white/25 mb-1.5">ROI</div><div className="text-xl font-display font-[700] text-green-400">+34.4%</div><div className="flex items-center gap-1.5 mt-2"><span className="iconify text-green-400/60" data-icon="mdi:arrow-up" data-width="10" /><span className="text-[10px] text-white/15">投資利益率</span></div></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-surface-800/40 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div><div className="text-xs font-medium text-white/60">資産推移</div><div className="text-[10px] text-white/20">過去6ヶ月</div></div>
                      <div className="flex gap-1">
                        <span className="text-[9px] px-2 py-1 rounded bg-gold-500/10 text-gold-400 border border-gold-500/15">6ヶ月</span>
                        <span className="text-[9px] px-2 py-1 rounded text-white/25">1年</span>
                        <span className="text-[9px] px-2 py-1 rounded text-white/25">全期間</span>
                      </div>
                    </div>
                    <div className="relative h-40 md:h-48">
                      <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="45" x2="600" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="135" x2="600" y2="135" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4a017" stopOpacity="0.15" /><stop offset="100%" stopColor="#d4a017" stopOpacity="0" /></linearGradient>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b8860b" /><stop offset="100%" stopColor="#f0d060" /></linearGradient>
                        </defs>
                        <path d="M0,150 L100,130 L200,95 L300,110 L400,70 L500,40 L600,25 L600,180 L0,180 Z" fill="url(#chartGrad)" />
                        <path d="M0,150 L100,130 L200,95 L300,110 L400,70 L500,40 L600,25" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="500" cy="40" r="3" fill="#d4a017" stroke="#06060a" strokeWidth="2" />
                        <circle cx="600" cy="25" r="4" fill="#f0d060" stroke="#06060a" strokeWidth="2" />
                      </svg>
                      <div className="absolute top-0 left-0 -translate-y-1 text-[9px] text-white/15">140万</div>
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[9px] text-white/15">100万</div>
                      <div className="absolute bottom-0 left-0 text-[9px] text-white/15">60万</div>
                      <div className="absolute bottom-0 left-0 translate-y-4 text-[9px] text-white/15">1月</div>
                      <div className="absolute bottom-0 left-[20%] translate-y-4 text-[9px] text-white/15">2月</div>
                      <div className="absolute bottom-0 left-[40%] translate-y-4 text-[9px] text-white/15">3月</div>
                      <div className="absolute bottom-0 left-[60%] translate-y-4 text-[9px] text-white/15">4月</div>
                      <div className="absolute bottom-0 left-[80%] translate-y-4 text-[9px] text-white/15">5月</div>
                      <div className="absolute bottom-0 right-0 translate-y-4 text-[9px] text-white/25 font-medium">6月</div>
                    </div>
                  </div>
                  <div className="bg-surface-800/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5"><div className="text-xs font-medium text-white/60">最近のカード</div><span className="text-[10px] text-gold-400 cursor-pointer">すべて見る</span></div>
                    <div className="divide-y divide-white/[0.03]">
                      {[
                        { name: 'ピカチュウ VMAX', sub: 'PSA 10 ・ ポケモン', price: '¥148,000', pct: '+32.4%', up: true, icon: 'mdi:lightning-bolt', color: 'text-gold-400/60', bg: 'linear-gradient(135deg, #1a3a2a, #162030)' },
                        { name: '青眼の白龍', sub: 'BGS 9.5 ・ 遊戯王', price: '¥89,000', pct: '-4.3%', up: false, icon: 'mdi:sword-cross', color: 'text-purple-400/60', bg: 'linear-gradient(135deg, #2a1a2a, #201620)' },
                        { name: 'ルフィ SR', sub: 'PSA 10 ・ ワンピース', price: '¥32,000', pct: '+18.5%', up: true, icon: 'mdi:pirate', color: 'text-orange-400/60', bg: 'linear-gradient(135deg, #2a2010, #1a1810)' },
                        { name: 'オメガモン', sub: 'CGC 10 ・ デジモン', price: '¥56,000', pct: '+8.2%', up: true, icon: 'mdi:dna', color: 'text-teal-400/60', bg: 'linear-gradient(135deg, #1a2a2a, #102018)' },
                        { name: '超サイヤ人孫悟空', sub: 'PSA 9 ・ ドラゴンボール', price: '¥125,000', pct: '+45.1%', up: true, icon: 'mdi:fire', color: 'text-amber-400/60', bg: 'linear-gradient(135deg, #2a1a10, #201510)' },
                      ].map((c) => (
                        <div key={c.name} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
                          <div className="w-9 h-12 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: c.bg }}>
                            <span className={`iconify ${c.color}`} data-icon={c.icon} data-width="14" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-white/70 truncate">{c.name}</div>
                            <div className="text-[9px] text-white/25">{c.sub}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[11px] font-display font-[600] text-white/70">{c.price}</div>
                            <div className={`text-[9px] ${c.up ? 'text-green-400' : 'text-red-400'}`}>{c.pct}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Supported Card Games */}
        <section id="supported" className="relative pt-20 pb-12 md:py-36">
          <div className="max-w-[1340px] mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <span className="text-xs font-medium text-gold-400 tracking-widest uppercase mb-4 block">Supported</span>
              <h2 className="font-body font-[700] text-3xl md:text-4xl tracking-tight mb-4">すべてのカードを、<span className="gold-text">ひとつの場所</span>で。</h2>
              <p className="text-white/35 max-w-md mx-auto text-sm leading-relaxed">主要タイトルはもちろん、あらゆるトレーディングカードの資産管理に対応しています。</p>
            </div>
            {(() => {
              const row1 = [
                { name: 'ポケモンカード', icon: 'mdi:lightning-bolt', color: '#fbbf24' },
                { name: '遊戯王OCG', icon: 'mdi:sword-cross', color: '#c084fc' },
                { name: 'ワンピースカード', icon: 'mdi:pirate', color: '#fb923c' },
                { name: 'デジモンカード', icon: 'mdi:dna', color: '#2dd4bf' },
                { name: 'ドラゴンボール超', icon: 'mdi:fire', color: '#f59e0b' },
                { name: 'デュエル・マスターズ', icon: 'mdi:shield-sword-outline', color: '#f472b6' },
              ];
              const row2 = [
                { name: 'ユニオンアリーナ', icon: 'mdi:star-four-points', color: '#38bdf8' },
                { name: 'MTG', icon: 'mdi:pentagon-outline', color: '#818cf8' },
                { name: 'ヴァイスシュヴァルツ', icon: 'mdi:cards-heart', color: '#fb7185' },
                { name: 'コナンカード', icon: 'mdi:magnify', color: '#60a5fa' },
                { name: 'ガンダムカード', icon: 'mdi:robot-outline', color: '#f87171' },
                { name: 'ウルトラマン', icon: 'mdi:flash-outline', color: '#c084fc' },
                { name: 'ゴジラカード', icon: 'mdi:paw', color: '#4ade80' },
                { name: 'その他', icon: 'mdi:dots-horizontal', color: 'rgba(255,255,255,0.35)' },
              ];
              const renderItem = (t: { name: string; icon: string; color: string }, i: number) => (
                <div key={`${t.name}-${i}`} className="lp-marquee-item">
                  <div className="lp-marquee-icon" style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                    <span className="iconify" data-icon={t.icon} data-width="14" style={{ color: t.color }} />
                  </div>
                  <span className="font-body font-[500] text-xs md:text-sm text-white/70">{t.name}</span>
                </div>
              );
              return (
                <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Row 1: left to right */}
                  <div className="lp-marquee-wrap">
                    <div className="lp-marquee-track">
                      {row1.map(renderItem)}
                      {row1.map((t, i) => renderItem(t, i + row1.length))}
                    </div>
                  </div>
                  {/* Row 2: right to left */}
                  <div className="lp-marquee-wrap">
                    <div className="lp-marquee-track-reverse">
                      {row2.map(renderItem)}
                      {row2.map((t, i) => renderItem(t, i + row2.length))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="relative py-28 md:py-36">
          <div className="max-w-[1340px] mx-auto px-6">
            <div className="relative reveal">
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(212,160,23,0.08) 0%, rgba(184,134,11,0.03) 50%, transparent 100%)' }} />
                <div className="absolute inset-0 border border-gold-500/10 rounded-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }} />
              </div>
              <div className="relative z-10 text-center py-20 px-6 md:px-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/15 mb-6">
                  <span className="iconify text-green-400" data-icon="mdi:check-circle" data-width="14" />
                  <span className="text-xs font-medium text-green-400">クレジットカード不要</span>
                </div>
                <h2 className="font-body font-[700] text-3xl md:text-5xl tracking-tight mb-5">今すぐ<span className="gold-text">無料</span>で始めよう</h2>
                <p className="text-white/35 max-w-lg mx-auto text-sm leading-relaxed mb-10">登録から1分で利用開始。手持ちのカードを登録して、投資の全体像を把握しましょう。機能制限は一切ありません。</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  <Link href="/signup" className="btn-primary text-base" style={{ padding: '16px 48px' }}>
                    無料で新規登録
                    <span className="iconify" data-icon="mdi:arrow-right" data-width="20" />
                  </Link>
                </div>
                <p className="text-[11px] text-white/15 mt-6">利用規約 ・ プライバシーポリシーに同意の上ご利用ください</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Footer */}
        <footer className="border-t border-white/5 py-10">
          <div className="max-w-[1340px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-display font-[800] text-lg tracking-tight gold-text">TCGVault</span>
                <span className="text-[10px] text-white/15 ml-2">Trading Card Portfolio Manager</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-xs text-white/25 hover:text-white/50 transition-colors">利用規約</Link>
                <Link href="/privacy" className="text-xs text-white/25 hover:text-white/50 transition-colors">プライバシーポリシー</Link>
                <Link href="/contact" className="text-xs text-white/25 hover:text-white/50 transition-colors">お問い合わせ</Link>
              </div>
              <div className="text-[11px] text-white/15">© 2025 TCGVault. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
