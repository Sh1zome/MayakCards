import { useEffect, useMemo, useState } from 'react';
import GameModal from '../components/GameModal';
import {
  CATEGORY_ORDER,
  categoryLabel,
  fetchGames,
  gameCover,
} from '../lib/games';
import type { GameCategory, GameData } from '../types';

export default function StudyPage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<GameCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<GameData | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchGames()
      .then((data) => {
        setGames(data);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = category === 'all' ? games : games.filter((g) => g.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [games, category, query]);

  return (
    <section>
      <h1 className="page-title">Изучение</h1>
      <p className="page-sub">
        Каталог из{' '}
        <a href="https://sh1zome.github.io/Mayak-GameList/" target="_blank" rel="noreferrer">
          Mayak-GameList
        </a>
        : ВР, ВР Арена и Автосим. Откройте карточку, чтобы повторить материал.
      </p>

      <div className="field" style={{ marginBottom: '1rem', maxWidth: 420 }}>
        <span className="field__label">Поиск</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название игры…"
        />
      </div>

      {loading && <p className="empty">Загрузка каталога…</p>}
      {error && <p className="banner banner--err">{error}</p>}

      {!loading && !error && (
        <>
          <div className="genre-bar" role="tablist" aria-label="Категории" style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`genre-btn${category === 'all' ? ' active' : ''}`}
              onClick={() => setCategory('all')}
            >
              Все ({games.length})
            </button>
            {CATEGORY_ORDER.map((c) => {
              const count = games.filter((g) => g.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  className={`genre-btn${category === c ? ' active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {categoryLabel(c)} ({count})
                </button>
              );
            })}
          </div>

          <h2 className="page-title" style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>
            {category === 'all' ? 'Все игры' : categoryLabel(category)}
          </h2>

          {filtered.length === 0 && <p className="empty">Ничего не найдено</p>}

          <div className="study-grid">
            {filtered.map((game) => {
              const cover = gameCover(game);
              return (
                <button
                  key={`${game.category}-${game.id || ''}-${game.name}`}
                  type="button"
                  className="study-card"
                  onClick={() => setSelected(game)}
                >
                  <div className="study-card__cover">
                    {cover ? (
                      <img src={cover} alt="" loading="lazy" />
                    ) : (
                      <div className="study-card__placeholder">Нет превью</div>
                    )}
                    <span className="study-card__badge">{categoryLabel(game.category)}</span>
                  </div>
                  <div className="study-card__body">
                    <strong>{game.name}</strong>
                    {game.age && <span className="study-card__meta">{game.age}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selected && <GameModal game={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
