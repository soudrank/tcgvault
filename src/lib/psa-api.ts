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

export async function fetchPsaCertData(certNumber: string): Promise<PsaCertResult | null> {
  const token = process.env.PSA_API_TOKEN;
  if (!token) {
    console.error('[PSA API] PSA_API_TOKEN is not set');
    return null;
  }

  const headers = { Authorization: `bearer ${token}` };

  try {
    const certRes = await fetch(
      `${PSA_API_BASE}/cert/GetByCertNumber/${certNumber}`,
      { method: 'GET', headers, signal: AbortSignal.timeout(15_000) }
    );

    if (!certRes.ok) {
      console.error('[PSA API] Cert error:', certRes.status);
      return null;
    }

    const certData: PsaCertResponse = await certRes.json();

    if (!certData.PSACert) {
      console.warn('[PSA API] No cert data:', certData.ServerMessage ?? 'unknown');
      return null;
    }

    const cert = certData.PSACert;
    let gradeBreakdown: Record<string, number> = {};

    if (cert.SpecID) {
      const popRes = await fetch(
        `${PSA_API_BASE}/pop/GetPSASpecPopulation/${cert.SpecID}`,
        { method: 'GET', headers, signal: AbortSignal.timeout(15_000) }
      );

      if (popRes.ok) {
        const popData: PsaPopResponse = await popRes.json();
        if (popData.PSAPop) {
          gradeBreakdown = parseGradeBreakdown(popData.PSAPop);
        }
      } else {
        console.error('[PSA API] Pop error:', popRes.status);
      }
    }

    return {
      totalPop: cert.TotalPopulation ?? 0,
      gradeBreakdown,
      cardName: cert.Subject ?? null,
      grade: cert.CardGrade ?? null,
    };
  } catch (error) {
    console.error('[PSA API] Fetch failed:', error);
    return null;
  }
}
