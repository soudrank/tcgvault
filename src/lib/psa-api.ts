const PSA_API_BASE = 'https://api.psacard.com/publicapi';

export interface PsaCertResult {
  totalPop: number;
  gradeBreakdown: Record<string, number>;
  cardName: string | null;
  grade: string | null;
}

export interface PsaCertFetch {
  specId: number | null;
  cardName: string | null;
  grade: string | null;
  myGradePop: number;
}

export interface PsaPopulationFetch {
  gradeBreakdown: Record<string, number>;
  totalPop: number;
}

interface PsaCertResponse {
  IsValidRequest?: boolean;
  ServerMessage?: string;
  PSACert?: {
    CertNumber: string;
    SpecID?: number;
    Subject: string;
    Brand: string;
    CardGrade: string;
    TotalPopulation: number;
    TotalPopulationWithQualifier: number;
    PopulationHigher: number;
    [key: string]: unknown;
  };
}

interface PsaPopResponse {
  SpecID?: number;
  Description?: string;
  PSAPop?: Record<string, number>;
}

function parseGradeBreakdown(pop: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(pop)) {
    if (typeof value !== 'number' || value <= 0) continue;
    if (key === 'Total') continue;
    if (key.endsWith('Q')) continue;

    if (key === 'Auth') {
      result.auth = value;
      continue;
    }

    const match = key.match(/^Grade(\d+)(?:_(\d+))?$/);
    if (match) {
      const gradeStr = match[2] ? `${match[1]}.${match[2]}` : match[1];
      result[gradeStr] = value;
    }
  }
  return result;
}

function getToken(): string | null {
  const token = process.env.PSA_API_TOKEN;
  if (!token) {
    console.error('[PSA API] PSA_API_TOKEN is not set');
    return null;
  }
  return token;
}

export async function fetchPsaCert(certNumber: string): Promise<PsaCertFetch | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `${PSA_API_BASE}/cert/GetByCertNumber/${certNumber}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!res.ok) {
      console.error('[PSA API] Cert error:', res.status);
      return null;
    }

    const data: PsaCertResponse = await res.json();
    if (!data.PSACert) {
      console.warn('[PSA API] No cert data:', data.ServerMessage ?? 'unknown');
      return null;
    }

    const cert = data.PSACert;
    return {
      specId: cert.SpecID ?? null,
      cardName: cert.Subject ?? null,
      grade: cert.CardGrade ?? null,
      myGradePop: cert.TotalPopulation ?? 0,
    };
  } catch (error) {
    console.error('[PSA API] Cert fetch failed:', error);
    return null;
  }
}

export async function fetchPsaPopulation(specId: number): Promise<PsaPopulationFetch | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `${PSA_API_BASE}/pop/GetPSASpecPopulation/${specId}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!res.ok) {
      console.error('[PSA API] Pop error:', res.status);
      return null;
    }

    const data: PsaPopResponse = await res.json();
    if (!data.PSAPop) return null;

    return {
      gradeBreakdown: parseGradeBreakdown(data.PSAPop),
      totalPop: data.PSAPop.Total ?? 0,
    };
  } catch (error) {
    console.error('[PSA API] Pop fetch failed:', error);
    return null;
  }
}

export async function fetchPsaCertData(certNumber: string): Promise<PsaCertResult | null> {
  const cert = await fetchPsaCert(certNumber);
  if (!cert) return null;

  let gradeBreakdown: Record<string, number> = {};
  if (cert.specId) {
    const pop = await fetchPsaPopulation(cert.specId);
    if (pop) gradeBreakdown = pop.gradeBreakdown;
  }

  return {
    totalPop: cert.myGradePop,
    gradeBreakdown,
    cardName: cert.cardName,
    grade: cert.grade,
  };
}
