import type { GameCategory, GameData, GamesFile } from '../types';

const BASE =
  'https://raw.githubusercontent.com/Sh1zome/Mayak-GameList/main/client/public';

export const GAMELIST_SITE = 'https://sh1zome.github.io/Mayak-GameList/';

export const CATEGORY_META: Record<
  GameCategory,
  { label: string; file: string }
> = {
  autosim: { label: 'Автосим', file: 'autosim.json' },
  arena: { label: 'ВР Арена', file: 'arena.json' },
  vr: { label: 'ВР', file: 'vr.json' },
};

export const CATEGORY_ORDER: GameCategory[] = ['vr', 'arena', 'autosim'];

function parseGamesPayload(
  data: GamesFile | GameData[],
  category: GameCategory,
): GameData[] {
  const list = Array.isArray(data) ? data : data?.games;
  if (!Array.isArray(list)) return [];
  return list.map((g) => ({ ...g, category }));
}

async function fetchCategory(category: GameCategory): Promise<GameData[]> {
  const { file } = CATEGORY_META[category];
  const res = await fetch(`${BASE}/${file}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Не удалось загрузить ${file}: ${res.status}`);
  const data = (await res.json()) as GamesFile | GameData[];
  return parseGamesPayload(data, category);
}

export async function fetchGames(): Promise<GameData[]> {
  const chunks = await Promise.all(CATEGORY_ORDER.map((c) => fetchCategory(c)));
  return chunks.flat();
}

export function categoryLabel(category: GameCategory): string {
  return CATEGORY_META[category].label;
}

export function gameCover(game: GameData): string {
  return game.cardHeader || game.screenshots?.[0] || '';
}

export function findGame(
  games: GameData[],
  id: string,
  name: string,
): GameData | undefined {
  return games.find((g) => g.id === id) || games.find((g) => g.name === name);
}
