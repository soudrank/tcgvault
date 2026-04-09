'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { CardTitle } from '@/types/database';

const TITLE_COLORS: Record<string, string> = {
  pokemon: '#facc15',
  yugioh: '#a855f7',
  onepiece: '#ef4444',
  digimon: '#3b82f6',
  dragonball: '#f97316',
  duel_masters: '#22c55e',
  other: '#6b7280',
};

const TITLE_BG: Record<string, string> = {
  pokemon: 'linear-gradient(160deg, #2a2a10 0%, #1a1808 40%, #162030 100%)',
  yugioh: 'linear-gradient(160deg, #2a1a2a 0%, #180d28 40%, #201630 100%)',
  onepiece: 'linear-gradient(160deg, #2a1a1a 0%, #280d0d 40%, #201620 100%)',
  digimon: 'linear-gradient(160deg, #1a1a2a 0%, #0d1828 40%, #162030 100%)',
  dragonball: 'linear-gradient(160deg, #2a2010 0%, #281808 40%, #201620 100%)',
  duel_masters: 'linear-gradient(160deg, #1a2a1a 0%, #0d280d 40%, #162020 100%)',
  other: 'linear-gradient(160deg, #1a1a1a 0%, #121212 40%, #161616 100%)',
};

const TITLE_ICONS: Record<string, string> = {
  pokemon: 'mdi:lightning-bolt',
  yugioh: 'mdi:sword-cross',
  onepiece: 'mdi:pirate',
  digimon: 'mdi:dna',
  dragonball: 'mdi:fire',
  duel_masters: 'mdi:shield-sword-outline',
  other: 'mdi:card-outline',
};

interface Props {
  imageUrl: string | null;
  cardId: string;
  grade?: number | null;
  agency?: string;
  title: CardTitle;
  cardName: string;
}

export default function CardDetailSlab({ imageUrl, grade, agency, title, cardName }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const color = TITLE_COLORS[title] || TITLE_COLORS.other;
  const icon = TITLE_ICONS[title] || TITLE_ICONS.other;
  const bg = TITLE_BG[title] || TITLE_BG.other;

  useEffect(() => {
    if (!imageUrl) return;
    setImgSrc(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
    setImgError(false);
  }, [imageUrl]);

  return (
    <div
      className="card-slab"
      style={{
        borderColor: `${color}40`,
        boxShadow: `0 25px 60px -15px rgba(0,0,0,0.7), 0 0 40px ${color}10`,
      }}
    >
      {/* Top glow line (replaces ::before which is always gold) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, zIndex: 2 }} />
      <div className="card-slab-inner" style={{ borderColor: `${color}20` }}>
        <div className="card-art">
          {imgSrc && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imgSrc}
              alt={cardName}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => {
                if (imgSrc.includes('proxy-image')) {
                  setImgSrc(imageUrl);
                } else {
                  setImgError(true);
                }
              }}
            />
          ) : (
            <>
              <div className="card-art-bg" style={{ background: bg }} />
              <div className="card-art-icon">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: `${color}40`,
                      background: `radial-gradient(circle, ${color}1f 0%, transparent 70%)`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: `${color}4d`,
                        background: `radial-gradient(circle, ${color}2e 0%, transparent 70%)`,
                      }}
                    >
                      <Icon icon={icon} width={26} style={{ color }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="card-art-label" style={{ zIndex: 2 }}>
            <div className="text-[9px] text-white/30 tracking-wider uppercase font-display">
              {title}
            </div>
            <div className="text-sm font-bold text-white/85 mt-0.5">{cardName}</div>
          </div>
        </div>
        {(agency || grade !== undefined) && (
          <div className="card-slab-grade">
            <div>
              <div className="text-[8px] text-white/25 tracking-widest uppercase font-display">
                {agency ?? ''}
              </div>
              <div className="text-xl font-display font-extrabold gold-text leading-none mt-0.5">
                {grade ?? '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
