import { getCard, getPriceHistory } from '@/lib/actions/cards';
import { fetchEbayPrices } from '@/lib/ebay';
import { PriceHistoryChart } from '@/components/cards/PriceHistoryChart';
import {
  CARD_TITLE_LABELS,
  CARD_STATUS_LABELS,
  GRADING_AGENCY_LABELS,
} from '@/types/database';
import {
  getCostBasis,
  getTotalCost,
  getEstimatedProfit,
  getROI,
  formatCurrency,
  formatProfit,
} from '@/lib/calc/profit';
import Link from 'next/link';
import CardDetailSlab from '@/components/cards/slab/CardDetailSlab';
import { CardDetailImageUpload } from '@/components/cards/CardDetailImageUpload';
import { Icon } from '@iconify/react';
import { notFound } from 'next/navigation';
import DeleteCardButton from '@/components/portfolio/DeleteCardButton';
import DeleteImageButton from '@/components/portfolio/DeleteImageButton';
import { PsaPopulationChart } from '@/components/cards/PsaPopulationChart';
import { getPsaPopHistory, fetchAndStorePsaPop } from '@/lib/actions/psa-population';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const [card, priceHistory] = await Promise.all([
    getCard(id),
    getPriceHistory(id),
  ]);

  if (!card) notFound();

  // PSA Population + eBay出品を並列取得
  const hasPsa = card.grading_agency === 'PSA' && card.cert_number;

  const [psaPopHistoryRaw, ebayPrices] = await Promise.all([
    hasPsa ? getPsaPopHistory(card.id) : Promise.resolve([]),
    fetchEbayPrices(card.name, {
      grade: card.grade,
      agency: card.grading_agency !== 'none' ? card.grading_agency : undefined,
    }).catch(() => []),
  ]);

  // PSAデータなしの場合は初回取得を試みる
  let psaPopHistory = psaPopHistoryRaw;
  if (hasPsa && psaPopHistory.length === 0) {
    await fetchAndStorePsaPop(card.id).catch(() => null);
    psaPopHistory = await getPsaPopHistory(card.id);
  }

  const costBasis = getCostBasis(card);
  const totalCost = getTotalCost(card);
  const profit = getEstimatedProfit(card);
  const roi = getROI(card);

  const statusBadgeClass =
    card.status === 'graded'
      ? 'badge-graded'
      : card.status === 'sold'
      ? 'badge-sold'
      : card.status === 'submitted'
      ? 'badge-submitted'
      : 'badge-raw';

  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 1000, margin: '0 auto' }} className="md:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6 fade" style={{ marginTop: 8 }}>
        <Link
          href="/portfolio"
          className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs"
          style={{ width: 'fit-content' }}
        >
          <Icon icon="mdi:arrow-left" width={16} />
          カード一覧に戻る
        </Link>
      </div>

      {/* Card Header: Image + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-6">
        {/* Card Visual */}
        <div className="fade fd1">
          <CardDetailSlab
            imageUrl={card.image_url}
            cardId={card.id}
            grade={card.grade}
            agency={card.grading_agency !== 'none' ? card.grading_agency : undefined}
            title={card.title}
            cardName={card.name}
          />

          {/* Delete image + Image search */}
          <div className="mt-3">
            {card.image_url && (
              <DeleteImageButton cardId={card.id} />
            )}
            <div className={card.image_url ? 'mt-3' : ''}>
              <CardDetailImageUpload
                cardId={card.id}
                cardTitle={card.title}
                imageUrl={card.image_url}
                backImageUrl={card.back_image_url}
                searchOnly
              />
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="fade fd2">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="font-body font-bold text-2xl md:text-3xl tracking-tight text-white/85 mb-2">
                {card.display_name || card.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                <span className="text-xs text-white/30">{CARD_TITLE_LABELS[card.title]}</span>
                <span className={`badge ${statusBadgeClass}`}>
                  {CARD_STATUS_LABELS[card.status]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/cards/${card.id}/edit`}
                className="btn-icon"
                title="編集"
              >
                <Icon icon="mdi:pencil-outline" width={15} />
              </Link>
              <DeleteCardButton cardId={card.id} />
            </div>
          </div>

          {/* 鑑定情報 */}
          {card.grading_agency !== 'none' && (
            <div className="panel mb-4">
              <div className="px-4 py-3 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                <div className="text-[11px] text-white/45 uppercase tracking-wider font-display font-medium flex items-center gap-2">
                  <Icon icon="mdi:shield-check-outline" width={15} style={{ opacity: 0.6 }} />
                  鑑定情報
                </div>
              </div>
              <div className="px-4 py-1">
                <div className="info-row">
                  <span className="info-label">鑑定機関</span>
                  <span className="info-val">{GRADING_AGENCY_LABELS[card.grading_agency]}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">グレード</span>
                  <span className="info-val gold-text" style={{ fontSize: 16, fontWeight: 700 }}>
                    {card.grade ?? '未設定'}
                  </span>
                </div>
                {card.cert_number && (
                  <div className="info-row">
                    <span className="info-label">認定番号</span>
                    <span className="info-val" style={{ fontFamily: "'Outfit', monospace", letterSpacing: '0.04em' }}>
                      {card.cert_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 仕入れ金額 */}
          <div className="panel mb-4">
            <div className="px-4 py-3 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
              <div className="text-[11px] text-white/45 uppercase tracking-wider font-display font-medium flex items-center gap-2">
                <Icon icon="mdi:cart-outline" width={15} style={{ opacity: 0.6 }} />
                仕入れ金額
              </div>
            </div>
            <div className="px-4 py-1">
              <div className="info-row">
                <span className="info-label">カード本体価格</span>
                <span className="info-val">{formatCurrency(card.purchase_price)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">購入時送料</span>
                <span className="info-val">{formatCurrency(card.purchase_shipping)}</span>
              </div>
              <div className="info-row">
                <span className="info-label" style={{ color: 'rgba(255,255,255,0.4)' }}>仕入原価</span>
                <span className="info-val">{formatCurrency(costBasis)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">鑑定費用</span>
                <span className="info-val">{formatCurrency(card.grading_cost)}</span>
              </div>
              <div className="info-row total">
                <span className="info-label">総コスト</span>
                <span className="info-val">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* 利益分析 */}
          <div className="panel">
            <div className="px-4 py-3 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
              <div className="text-[11px] text-white/45 uppercase tracking-wider font-display font-medium flex items-center gap-2">
                <Icon icon="mdi:trending-up" width={15} style={{ opacity: 0.6 }} />
                利益分析
              </div>
            </div>
            <div className="px-4 py-1">
              <div className="info-row">
                <span className="info-label">想定相場</span>
                <span className="info-val" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {formatCurrency(card.estimated_price)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">想定利益</span>
                <span className={`info-val ${profit >= 0 ? 'green' : 'red'}`}>
                  {formatProfit(profit)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">ROI</span>
                <span className={`info-val ${roi >= 0 ? 'green' : 'red'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </span>
              </div>
              <div className="info-row" style={{ borderBottom: 'none', paddingBottom: 2 }}>
                <span className="info-label">売却価格</span>
                <span className="info-val" style={{ color: card.sold_price !== null ? undefined : 'rgba(255,255,255,0.2)' }}>
                  {card.sold_price !== null ? formatCurrency(card.sold_price) : '\u2014'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-6 fade fd4">
        <PriceHistoryChart
          history={priceHistory}
          currentPrice={card.estimated_price}
          ebayPrices={ebayPrices.map((p) => ({ price: p.price, recorded_at: p.recorded_at }))}
        />
      </div>

      {/* PSA Population Chart */}
      <div className="mb-6 fade fd5">
        {card.cert_number ? (
          <PsaPopulationChart history={psaPopHistory} cardId={card.id} />
        ) : (
          <div className="panel">
            <div className="px-6 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-display flex items-center gap-2">
                <Icon icon="mdi:shield-check-outline" width={12} style={{ opacity: 0.4 }} />
                PSA鑑定枚数
              </div>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-[12px] text-white/35">PSA認定番号を入力すると鑑定枚数の推移が表示されます</p>
              <Link
                href={`/cards/${card.id}/edit`}
                className="mt-3 inline-block rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                style={{ backgroundColor: 'rgba(232,184,48,0.1)', color: '#e8b830' }}
              >
                番号を入力する
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Memo */}
      {card.memo && (
        <div className="panel fade fd6">
          <div className="px-5 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] text-white/30 uppercase tracking-wider font-display flex items-center gap-2">
              <Icon icon="mdi:note-text-outline" width={12} style={{ opacity: 0.4 }} />
              メモ
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-[12px] text-white/35 leading-relaxed">{card.memo}</p>
          </div>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
