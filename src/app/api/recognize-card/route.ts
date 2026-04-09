import { NextRequest, NextResponse } from 'next/server';

interface RecognizeResult {
  cardName: string;
  displayName: string;
  title: 'pokemon' | 'yugioh' | 'onepiece' | 'dbs' | 'digimon' | 'other';
  gradingAgency: 'none' | 'psa' | 'bgs' | 'cgc' | 'ars';
  grade: string | null;
  certNumber: string | null;
  setName: string | null;
  cardNumber: string | null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  // 画像をbase64に変換
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mediaType = file.type || 'image/jpeg';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `このトレーディングカードの画像を分析して、以下の情報をJSON形式で返してください。

必ず以下のJSON形式のみで回答してください（説明文は不要）:
{
  "cardName": "eBay等で検索するための英語名（例: Charizard VMAX, Blue-Eyes White Dragon）",
  "displayName": "日本語の表示名（例: リザードンVMAX, 青眼の白龍）",
  "title": "pokemon/yugioh/onepiece/dbs/digimon/other のいずれか",
  "gradingAgency": "鑑定スラブの場合 psa/bgs/cgc/ars、未鑑定なら none",
  "grade": "鑑定グレード（例: 10, 9.5）、未鑑定なら null",
  "certNumber": "鑑定認定番号、なければ null",
  "setName": "セット名やエキスパンション名、不明なら null",
  "cardNumber": "カード番号（例: 308/190, OP09-118）、不明なら null"
}

鑑定スラブに入っている場合は、スラブのラベルからグレードや認定番号を読み取ってください。`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `Claude API error: ${err}` }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse response', raw: text }, { status: 500 });
  }

  try {
    const result: RecognizeResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON response', raw: text }, { status: 500 });
  }
}
