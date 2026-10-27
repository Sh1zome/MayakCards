import { ChangeEvent, useMemo, useState } from 'react';
import type { Card, GameCategory, GameData, QuestionType } from '../types';
import { uid } from '../lib/id';
import { CATEGORY_ORDER, categoryLabel } from '../lib/games';

interface Props {
  card: Card;
  games: GameData[];
  onChange: (card: Card) => void;
  onRemove: () => void;
}

export default function CardForm({ card, games, onChange, onRemove }: Props) {
  const [gameQuery, setGameQuery] = useState('');
  const [catFilter, setCatFilter] = useState<GameCategory | 'all'>('all');

  function patch(partial: Partial<Card>) {
    onChange({ ...card, ...partial });
  }

  function setType(type: QuestionType) {
    if (type === 'text') {
      patch({ type, options: [] });
      return;
    }
    const options =
      card.options && card.options.length
        ? card.options
        : [
            { id: uid('opt'), text: 'Вариант 1', correct: true },
            { id: uid('opt'), text: 'Вариант 2', correct: false },
          ];
    if (type === 'single') {
      let seen = false;
      patch({
        type,
        options: options.map((o) => {
          if (o.correct && !seen) {
            seen = true;
            return o;
          }
          return { ...o, correct: false };
        }),
      });
      return;
    }
    patch({ type, options });
  }

  function updateOption(id: string, text: string) {
    patch({
      options: (card.options ?? []).map((o) => (o.id === id ? { ...o, text } : o)),
    });
  }

  function toggleCorrect(id: string) {
    if (card.type === 'single') {
      patch({
        options: (card.options ?? []).map((o) => ({ ...o, correct: o.id === id })),
      });
      return;
    }
    patch({
      options: (card.options ?? []).map((o) =>
        o.id === id ? { ...o, correct: !o.correct } : o,
      ),
    });
  }

  function addOption() {
    patch({
      options: [...(card.options ?? []), { id: uid('opt'), text: 'Новый вариант', correct: false }],
    });
  }

  function removeOption(id: string) {
    patch({ options: (card.options ?? []).filter((o) => o.id !== id) });
  }

  function onPhotoFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') patch({ photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function toggleGame(game: GameData) {
    const id = game.id || game.name;
    const linked = card.linkedGames ?? [];
    const exists = linked.some((g) => g.id === id || g.name === game.name);
    if (exists) {
      patch({ linkedGames: linked.filter((g) => g.id !== id && g.name !== game.name) });
    } else {
      patch({
        linkedGames: [
          ...linked,
          { id, name: game.name, category: game.category },
        ],
      });
    }
  }

  const filteredGames = useMemo(() => {
    const q = gameQuery.trim().toLowerCase();
    return games
      .filter((g) => (catFilter === 'all' ? true : g.category === catFilter))
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [games, gameQuery, catFilter]);

  const grouped = useMemo(() => {
    const map = new Map<GameCategory, GameData[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const g of filteredGames) {
      map.get(g.category)?.push(g);
    }
    return map;
  }, [filteredGames]);

  return (
    <div className="editor-card">
      <div className="editor-card__head">
        <strong>Карточка</strong>
        <button type="button" className="btn btn--sm btn--danger" onClick={onRemove}>
          Удалить
        </button>
      </div>

      <div className="field">
        <span className="field__label">Тема вопроса</span>
        <input
          value={card.topic}
          onChange={(e) => patch({ topic: e.target.value })}
          placeholder="Например: Хоррор / Управление"
        />
      </div>

      <div className="field">
        <span className="field__label">Вопрос</span>
        <textarea
          value={card.question}
          onChange={(e) => patch({ question: e.target.value })}
          placeholder="Текст вопроса"
        />
      </div>

      <div className="field">
        <span className="field__label">Описание (подсказка на карточке)</span>
        <textarea
          value={card.description ?? ''}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Необязательно"
        />
      </div>

      <div className="field">
        <span className="field__label">Фото — URL</span>
        <input
          value={card.photo?.startsWith('data:') ? '' : card.photo ?? ''}
          onChange={(e) => patch({ photo: e.target.value })}
          placeholder="https://…"
        />
      </div>
      <div className="field">
        <span className="field__label">или загрузить файл</span>
        <input type="file" accept="image/*" onChange={onPhotoFile} />
      </div>
      {card.photo && <img className="photo-preview" src={card.photo} alt="" />}

      <div className="field">
        <span className="field__label">Тип ответа</span>
        <select
          value={card.type}
          onChange={(e) => setType(e.target.value as QuestionType)}
        >
          <option value="single">Один правильный</option>
          <option value="multiple">Несколько правильных</option>
          <option value="text">Свой текстовый ответ</option>
        </select>
      </div>

      <div className="field">
        <span className="field__label">Баллы</span>
        <input
          type="number"
          min={0}
          step={1}
          value={card.points ?? 1}
          onChange={(e) => patch({ points: Number(e.target.value) || 0 })}
        />
      </div>

      {(card.type === 'single' || card.type === 'multiple') && (
        <div className="stack">
          <strong>Варианты ответа</strong>
          {(card.options ?? []).map((opt) => (
            <div key={opt.id} className="option-editor">
              <input
                value={opt.text}
                onChange={(e) => updateOption(opt.id, e.target.value)}
              />
              <label className="checkbox-row">
                <input
                  type={card.type === 'single' ? 'radio' : 'checkbox'}
                  name={`correct-${card.id}`}
                  checked={!!opt.correct}
                  onChange={() => toggleCorrect(opt.id)}
                />
                верно
              </label>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => removeOption(opt.id)}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--sm btn--ghost" onClick={addOption}>
            + вариант
          </button>
        </div>
      )}

      <div className="field">
        <span className="field__label">Связанные игры (Mayak-GameList)</span>
        <div className="genre-bar" style={{ marginBottom: '0.5rem' }}>
          <button
            type="button"
            className={`genre-btn${catFilter === 'all' ? ' active' : ''}`}
            onClick={() => setCatFilter('all')}
          >
            Все
          </button>
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              className={`genre-btn${catFilter === c ? ' active' : ''}`}
              onClick={() => setCatFilter(c)}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Фильтр по названию…"
          value={gameQuery}
          onChange={(e) => setGameQuery(e.target.value)}
        />
        <div className="games-picker">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? [];
            if (!list.length) return null;
            return (
              <div key={cat} className="games-picker__group">
                <div className="games-picker__group-title">{categoryLabel(cat)}</div>
                {list.map((g) => {
                  const gid = g.id || g.name;
                  const checked = (card.linkedGames ?? []).some(
                    (x) => x.id === gid || x.name === g.name,
                  );
                  return (
                    <label key={`${cat}-${gid}`} className="games-picker__item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGame(g)}
                      />
                      <span className="games-picker__name">{g.name}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
          {filteredGames.length === 0 && (
            <p className="empty" style={{ padding: '0.75rem' }}>
              {games.length === 0 ? 'Каталог игр не загружен' : 'Ничего не найдено'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
