import type { GradingAgency } from '@/types/database';

export interface GradingServiceLevel {
  name: string;
  priceUsd: number;
  estimatedDays: number;
}

export interface AgencyInfo {
  name: string;
  serviceLevels: GradingServiceLevel[];
  domesticShippingUsd: number;
  returnShippingUsd: number;
}

/** 鑑定機関の料金データ */
export const AGENCY_DATA: Record<Exclude<GradingAgency, 'none'>, AgencyInfo> = {
  PSA: {
    name: 'PSA',
    serviceLevels: [
      { name: 'バリュー', priceUsd: 18, estimatedDays: 120 },
      { name: 'レギュラー', priceUsd: 50, estimatedDays: 65 },
      { name: 'エクスプレス', priceUsd: 100, estimatedDays: 20 },
      { name: 'スーパーエクスプレス', priceUsd: 200, estimatedDays: 10 },
    ],
    domesticShippingUsd: 20,
    returnShippingUsd: 30,
  },
  BGS: {
    name: 'BGS (Beckett)',
    serviceLevels: [
      { name: 'エコノミー', priceUsd: 22, estimatedDays: 90 },
      { name: 'スタンダード', priceUsd: 40, estimatedDays: 45 },
      { name: 'エクスプレス', priceUsd: 100, estimatedDays: 15 },
      { name: 'プレミアム', priceUsd: 250, estimatedDays: 5 },
    ],
    domesticShippingUsd: 18,
    returnShippingUsd: 28,
  },
  CGC: {
    name: 'CGC',
    serviceLevels: [
      { name: 'エコノミー', priceUsd: 15, estimatedDays: 100 },
      { name: 'スタンダード', priceUsd: 35, estimatedDays: 50 },
      { name: 'エクスプレス', priceUsd: 75, estimatedDays: 15 },
    ],
    domesticShippingUsd: 15,
    returnShippingUsd: 25,
  },
  ARS: {
    name: 'ARS',
    serviceLevels: [
      { name: 'レギュラー', priceUsd: 20, estimatedDays: 60 },
      { name: 'エクスプレス', priceUsd: 50, estimatedDays: 20 },
    ],
    domesticShippingUsd: 15,
    returnShippingUsd: 20,
  },
  Gemix: {
    name: 'Gemix',
    serviceLevels: [
      { name: 'レギュラー', priceUsd: 15, estimatedDays: 90 },
      { name: 'エクスプレス', priceUsd: 40, estimatedDays: 30 },
    ],
    domesticShippingUsd: 10,
    returnShippingUsd: 15,
  },
  TAG: {
    name: 'TAG',
    serviceLevels: [
      { name: 'レギュラー', priceUsd: 18, estimatedDays: 75 },
      { name: 'エクスプレス', priceUsd: 45, estimatedDays: 25 },
    ],
    domesticShippingUsd: 12,
    returnShippingUsd: 18,
  },
};

export interface GradingSimulationInput {
  agency: Exclude<GradingAgency, 'none'>;
  serviceLevelIndex: number;
  quantity: number;
  includeInternationalShipping: boolean;
  usdToJpy: number;
}

export interface GradingSimulationResult {
  gradingFeeUsd: number;
  shippingToUsd: number;
  shippingReturnUsd: number;
  customsDutyJpy: number;
  totalUsd: number;
  totalJpy: number;
  perCardJpy: number;
}

/** 鑑定費用シミュレーション */
export function simulateGradingCost(input: GradingSimulationInput): GradingSimulationResult {
  const agency = AGENCY_DATA[input.agency];
  const level = agency.serviceLevels[input.serviceLevelIndex];

  const gradingFeeUsd = level.priceUsd * input.quantity;
  const shippingToUsd = input.includeInternationalShipping ? agency.domesticShippingUsd : 0;
  const shippingReturnUsd = input.includeInternationalShipping ? agency.returnShippingUsd : 0;

  const totalUsd = gradingFeeUsd + shippingToUsd + shippingReturnUsd;
  const totalJpyBeforeDuty = Math.round(totalUsd * input.usdToJpy);

  // 関税概算: 総額の約10%（簡易計算）
  const customsDutyJpy = input.includeInternationalShipping
    ? Math.round(totalJpyBeforeDuty * 0.1)
    : 0;

  const totalJpy = totalJpyBeforeDuty + customsDutyJpy;
  const perCardJpy = input.quantity > 0 ? Math.round(totalJpy / input.quantity) : 0;

  return {
    gradingFeeUsd,
    shippingToUsd,
    shippingReturnUsd,
    customsDutyJpy,
    totalUsd,
    totalJpy,
    perCardJpy,
  };
}
