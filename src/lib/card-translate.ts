// 日本語→英語のカード名マッピング（主要なもの）
const JA_TO_EN: Record<string, string> = {
  'リザードン': 'charizard', 'メガリザードン': 'mega charizard',
  'ピカチュウ': 'pikachu', 'ミュウツー': 'mewtwo', 'ミュウ': 'mew',
  'ルギア': 'lugia', 'レックウザ': 'rayquaza', 'ゲンガー': 'gengar',
  'ギャラドス': 'gyarados', 'カイリュー': 'dragonite', 'リーリエ': 'lillie',
  'サーナイト': 'gardevoir', 'ルカリオ': 'lucario', 'イーブイ': 'eevee',
  'ブラッキー': 'umbreon', 'ニンフィア': 'sylveon', 'グレイシア': 'glaceon',
  'フシギバナ': 'venusaur', 'カメックス': 'blastoise', 'アルセウス': 'arceus',
  'パルキア': 'palkia', 'ディアルガ': 'dialga', 'ギラティナ': 'giratina',
  'ゼクロム': 'zekrom', 'レシラム': 'reshiram', 'ナンジャモ': 'iono',
  'ヒトカゲ': 'charmander', 'ゼニガメ': 'squirtle', 'フシギダネ': 'bulbasaur',
  'コイキング': 'magikarp', 'カビゴン': 'snorlax', 'プリン': 'jigglypuff',
  'エンテイ': 'entei', 'スイクン': 'suicune', 'ライコウ': 'raikou',
  'ホウオウ': 'ho-oh', 'セレビィ': 'celebi', 'マリィ': 'marnie',
  'アセロラ': 'acerola', 'シロナ': 'cynthia', 'セレナ': 'serena',
  'ブルーアイズ': 'blue-eyes', '青眼の白龍': 'blue-eyes white dragon',
  'ブラックマジシャン': 'dark magician', '真紅眼の黒竜': 'red-eyes black dragon',
  'ブラマジガール': 'dark magician girl', 'エクゾディア': 'exodia',
  '灰流うらら': 'ash blossom', '増殖するG': 'maxx c',
  // デジモン
  'ウォーグレイモン': 'wargreymon', 'メタルグレイモン': 'metalgreymon',
  'オメガモン': 'omnimon', 'アグモン': 'agumon', 'ガブモン': 'gabumon',
  'メタルガルルモン': 'metalgarurumon', 'エンジェモン': 'angemon',
  'デュークモン': 'gallantmon', 'インペリアルドラモン': 'imperialdramon',
  'ベルゼブモン': 'beelzemon', 'デジモン': 'digimon',
  // ワンピース
  'ルフィ': 'luffy', 'ゾロ': 'zoro', 'ナミ': 'nami', 'サンジ': 'sanji',
  'シャンクス': 'shanks', 'エース': 'ace', 'ヤマト': 'yamato',
  // ドラゴンボール
  '孫悟空': 'son goku', 'ベジータ': 'vegeta', 'フリーザ': 'frieza',
  'セル': 'cell', '魔人ブウ': 'majin buu', 'ゴハン': 'gohan',
};

export function translateCardName(query: string): string {
  // 完全一致
  const exact = JA_TO_EN[query];
  if (exact) return exact;

  // 部分一致（最長マッチ）
  for (const [ja, en] of Object.entries(JA_TO_EN)) {
    if (query.includes(ja)) {
      return query.replace(ja, en);
    }
  }

  return query;
}
