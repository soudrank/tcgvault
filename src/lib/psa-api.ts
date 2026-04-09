const PSA_API_BASE = 'https://api.psacard.com/publicapi';

export interface PsaCertResult {
  totalPop: number;
  gradeBreakdown: Record<string, number>;
  cardName: string | null;
  grade: string | null;
}

interface PsaCertResponse {
  IsValidRequest?: boolean;
  ServerMessage?: string;
  PSACert?: {
    CertNumber: string;
    Subject: string;
    Brand: string;
    CardGrade: string;
    TotalPopulation: number;
    TotalPopulationWithQualifier: number;
    PopulationHigher: number;
    [key: string]: unknown;
  };
}

export async function fetchPsaCertData(certNumber: string): Promise<PsaCertResult | null> {
  const token = process.env.PSA_API_TOKEN;
  if (!token) {
    console.error('[PSA API] PSA_API_TOKEN is not set');
    return null;
  }

  try {
    const res = await fetch(
      `${PSA_API_BASE}/cert/GetByCertNumber/${certNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `bearer ${token}`,
        },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!res.ok) {
      console.error('[PSA API] Error:', res.status);
      return null;
    }

    const data: PsaCertResponse = await res.json();

    if (!data.PSACert) {
      console.warn('[PSA API] No cert data:', data.ServerMessage ?? 'unknown');
      return null;
    }

    const cert = data.PSACert;

    return {
      totalPop: cert.TotalPopulation ?? 0,
      gradeBreakdown: {},
      cardName: cert.Subject ?? null,
      grade: cert.CardGrade ?? null,
    };
  } catch (error) {
    console.error('[PSA API] Fetch failed:', error);
    return null;
  }
}
