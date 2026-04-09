'use client';

import { useState, useMemo, useRef } from 'react';
import type { Card, CardTitle, GradingAgency, CardStatus } from '@/types/database';
import { CARD_TITLE_LABELS, GRADING_AGENCY_LABELS, CARD_STATUS_LABELS } from '@/types/database';
import {
  getCostBasis,
  getTotalCost,
  getEstimatedProfit,
  getROI,
  formatCurrency,
  formatProfit,
} from '@/lib/calc/profit';
import { createCard, updateCard } from '@/lib/actions/cards';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { EbayNameSuggest } from './EbayNameSuggest';

interface Props {
  card?: Card;
}

export default function CardForm({ card }: Props) {
  const router = useRouter();
  const isEdit = !!card;

  const [title, setTitle] = useState<CardTitle>(card?.title ?? 'pokemon');
  const [displayName, setDisplayName] = useState(card?.display_name ?? '');
  const [name, setName] = useState(card?.name ?? '');
  const [imageUrl, setImageUrl] = useState(card?.image_url ?? '');
  const backImageUrl = card?.back_image_url ?? '';
  const [purchasePrice, setPurchasePrice] = useState(card?.purchase_price ?? 0);
  const [purchaseShipping, setPurchaseShipping] = useState(card?.purchase_shipping ?? 0);
  const [gradingAgency, setGradingAgency] = useState<GradingAgency>(card?.grading_agency ?? 'none');
  const [grade, setGrade] = useState<string>(card?.grade?.toString() ?? '');
  const [certNumber, setCertNumber] = useState(card?.cert_number ?? '');
  const [gradingCost, setGradingCost] = useState(card?.grading_cost ?? 0);
  const [estimatedPrice, setEstimatedPrice] = useState(card?.estimated_price ?? 0);
  const [soldPrice, setSoldPrice] = useState<number | null>(card?.sold_price ?? null);
  const [soldAt, setSoldAt] = useState(card?.sold_at?.slice(0, 10) ?? '');
  const [platformFee, setPlatformFee] = useState(card?.platform_fee ?? 0);
  const [quantity, setQuantity] = useState(card?.quantity ?? 1);
  const [status, setStatus] = useState<CardStatus>(card?.status ?? 'raw');
  const [memo, setMemo] = useState(card?.memo ?? '');
  const [ebayLinked, setEbayLinked] = useState(card?.ebay_linked ?? false);

  const cardData = useMemo(
    () => ({
      purchase_price: purchasePrice,
      purchase_shipping: purchaseShipping,
      grading_cost: gradingCost,
      estimated_price: estimatedPrice,
    }),
    [purchasePrice, purchaseShipping, gradingCost, estimatedPrice]
  );

  const costBasis = useMemo(() => getCostBasis(cardData), [cardData]);
  const totalCost = useMemo(() => getTotalCost(cardData), [cardData]);
  const profit = useMemo(() => getEstimatedProfit(cardData), [cardData]);
  const roi = useMemo(() => getROI(cardData), [cardData]);

  const netProceeds = (soldPrice ?? 0) - platformFee;
  const realizedProfit = netProceeds - totalCost;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRecognize = async (file: File) => {
    setRecognizing(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/recognize-card', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'カード認識に失敗しました');
        return;
      }
      if (data.displayName) setDisplayName(data.displayName);
      if (data.cardName) setName(data.cardName);
      if (data.title) setTitle(data.title as CardTitle);
      if (data.gradingAgency && data.gradingAgency !== 'none') {
        setGradingAgency(data.gradingAgency as GradingAgency);
      }
      if (data.grade) setGrade(data.grade);
      if (data.certNumber) setCertNumber(data.certNumber);
    } catch {
      setError('カード認識に失敗しました');
    } finally {
      setRecognizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = {
      title,
      name,
      display_name: displayName || null,
      image_url: imageUrl || null,
      back_image_url: backImageUrl || null,
      purchase_price: purchasePrice,
      purchase_shipping: purchaseShipping,
      grading_agency: gradingAgency,
      grade: grade ? parseFloat(grade) : null,
      grading_cost: gradingCost,
      cert_number: certNumber || null,
      estimated_price: estimatedPrice,
      sold_price: soldPrice,
      sold_at: soldAt || null,
      platform_fee: platformFee,
      quantity,
      status,
      memo: memo || null,
      ebay_linked: ebayLinked,
    };

    try {
      if (isEdit) {
        await updateCard(card.id, formData);
        router.push(`/portfolio/${card.id}`);
      } else {
        await createCard(formData);
        router.push('/portfolio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setLoading(false);
    }
  };

  const profitColor = (v: number) =>
    v > 0 ? '#4ade80' : v < 0 ? '#f87171' : 'rgba(255,255,255,0.2)';

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger mb-8">{error}</p>
      )}

      {/* ===== カード画像認識（ANTHROPIC_API_KEY設定時のみ有効） ===== */}
      {false && !isEdit && (
        <section className="mb-8 fade fd1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleRecognize(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={recognizing}
            className="w-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '16px 20px',
              background: 'rgba(212,160,23,0.06)',
              border: '1px dashed rgba(212,160,23,0.25)',
              borderRadius: 12,
              color: 'rgba(232,184,48,0.8)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {recognizing ? (
              <>
                <span className="spinner" />
                カードを認識中...
              </>
            ) : (
              <>
                <Icon icon="mdi:camera-outline" width={20} />
                カードを撮影して自動入力
              </>
            )}
          </button>
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            カードの写真からAIが名前・鑑定情報を自動認識します
          </div>
        </section>
      )}

      {/* ===== 基本情報 ===== */}
      <section className="mb-8 fade fd1 relative z-10">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.12)' }}
          >
            <Icon icon="mdi:card-text-outline" width={15} className="text-gold-400" />
          </span>
          基本情報
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label className="field-label">タイトル</label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value as CardTitle)}
              className="fi fi-select"
            >
              {(Object.entries(CARD_TITLE_LABELS) as [CardTitle, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="field-label">カード名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: ピカチュウ"
              className="fi"
            />
            <div className="field-note">実際に表示される名前</div>
          </div>
          <div className="md:col-span-2">
            <EbayNameSuggest
              value={name}
              onChange={setName}
              onSelectPrice={(price) => {
                setEstimatedPrice(price);
                setEbayLinked(true);
              }}
              label="eBay情報検索"
              note="カード名で検索してeBayの出品から相場情報を取得できます"
            />
          </div>
          <div>
            <label className="field-label">数量</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">ステータス</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CardStatus)}
              className="fi fi-select"
            >
              {(Object.entries(CARD_STATUS_LABELS) as [CardStatus, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* ===== 仕入れ金額 ===== */}
      <section className="mb-8 fade fd2">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}
          >
            <Icon icon="mdi:cart-outline" width={15} className="text-blue-400/70" />
          </span>
          仕入れ金額
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-4">
          <div>
            <label className="field-label">カード本体価格（円）</label>
            <input
              type="number"
              min={0}
              value={purchasePrice || ''}
              onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
              placeholder="0"
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">購入時送料（円）</label>
            <input
              type="number"
              min={0}
              value={purchaseShipping || ''}
              onChange={(e) => setPurchaseShipping(Number(e.target.value) || 0)}
              placeholder="0"
              className="fi"
            />
          </div>
        </div>
        <div className="calc-box flex items-center justify-between">
          <div>
            <div className="calc-label">仕入原価合計</div>
            <div className="text-[10px] text-white/12">本体価格 + 送料</div>
          </div>
          <div className="calc-value text-white/70">{formatCurrency(costBasis)}</div>
        </div>
      </section>

      {/* ===== 鑑定情報 ===== */}
      <section className="mb-8 fade fd3">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}
          >
            <Icon icon="mdi:shield-check-outline" width={15} className="text-green-400/70" />
          </span>
          鑑定情報
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label className="field-label">鑑定機関</label>
            <select
              value={gradingAgency}
              onChange={(e) => setGradingAgency(e.target.value as GradingAgency)}
              className="fi fi-select"
            >
              {(Object.entries(GRADING_AGENCY_LABELS) as [GradingAgency, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="field-label">グレード</label>
            <input
              type="number"
              step="0.5"
              min={1}
              max={10}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="例: 10"
              disabled={gradingAgency === 'none'}
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">PSA認定番号</label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="例: 12345678"
              disabled={gradingAgency === 'none'}
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">鑑定費用（円）</label>
            <input
              type="number"
              min={0}
              value={gradingCost || ''}
              onChange={(e) => setGradingCost(Number(e.target.value) || 0)}
              placeholder="0"
              disabled={gradingAgency === 'none'}
              className="fi"
            />
          </div>
        </div>
      </section>

      {/* ===== 相場・利益 ===== */}
      <section className="mb-8 fade fd4">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.1)' }}
          >
            <Icon icon="mdi:chart-line" width={15} className="text-gold-400/70" />
          </span>
          相場・利益
        </div>
        <div className="mb-4">
          <label className="field-label">現在の想定相場（円）</label>
          <input
            type="number"
            min={0}
            value={estimatedPrice || ''}
            onChange={(e) => setEstimatedPrice(Number(e.target.value) || 0)}
            placeholder="0"
            className="fi"
            style={{ maxWidth: 280 }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="calc-box">
            <div className="calc-label">総コスト</div>
            <div className="text-[9px] text-white/10 mb-1">仕入原価 + 鑑定費</div>
            <div className="calc-value text-white/60">{formatCurrency(totalCost)}</div>
          </div>
          <div className="calc-box">
            <div className="calc-label">想定利益</div>
            <div className="text-[9px] text-white/10 mb-1">相場 − 総コスト</div>
            <div className="calc-value" style={{ color: profitColor(profit) }}>
              {formatProfit(profit)}
            </div>
          </div>
          <div className="calc-box">
            <div className="calc-label">ROI</div>
            <div className="text-[9px] text-white/10 mb-1">利益 / 総コスト</div>
            <div className="calc-value" style={{ color: profitColor(roi) }}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </div>
          </div>
        </div>
      </section>

      {/* ===== 売却情報 ===== */}
      <section className="mb-8 fade fd5">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.1)' }}
          >
            <Icon icon="mdi:cash-register" width={15} className="text-purple-400/70" />
          </span>
          売却情報
          <span className="text-[9px] text-white/15 font-normal ml-1">— 売却済の場合のみ入力</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-4">
          <div>
            <label className="field-label">売却価格（円）</label>
            <input
              type="number"
              min={0}
              value={soldPrice ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setSoldPrice(v === '' ? null : Number(v) || 0);
                if (v !== '' && status !== 'sold') setStatus('sold');
              }}
              placeholder="未売却"
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">手数料（円）</label>
            <input
              type="number"
              min={0}
              value={platformFee || ''}
              onChange={(e) => setPlatformFee(Number(e.target.value) || 0)}
              placeholder="例: メルカリ10%"
              className="fi"
            />
            <div className="field-note">プラットフォーム手数料を入力</div>
          </div>
          <div>
            <label className="field-label">売却日</label>
            <input
              type="date"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              className="fi fi-select"
            />
          </div>
        </div>
        {soldPrice !== null && soldPrice > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="calc-box">
              <div className="calc-label">手取り</div>
              <div className="text-[9px] text-white/10 mb-1">売却価格 − 手数料</div>
              <div className="calc-value text-white/60">{formatCurrency(netProceeds)}</div>
            </div>
            <div className="calc-box">
              <div className="calc-label">実現利益</div>
              <div className="text-[9px] text-white/10 mb-1">手取り − 総コスト</div>
              <div className="calc-value" style={{ color: profitColor(realizedProfit) }}>
                {formatProfit(realizedProfit)}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== メモ ===== */}
      <section className="mb-10 fade fd6">
        <div className="section-title">
          <span
            className="st-icon"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Icon icon="mdi:note-text-outline" width={15} className="text-white/35" />
          </span>
          メモ
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="備考を入力してください..."
          className="fi"
        />
      </section>

      {/* ===== Submit ===== */}
      <div className="flex items-center gap-3 pb-10 fade fd6">
        <button
          type="submit"
          disabled={loading}
          className="btn-submit"
        >
          <Icon icon="mdi:content-save-outline" width={16} />
          {loading ? '保存中...' : isEdit ? '更新する' : '保存する'}
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={() => router.back()}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
