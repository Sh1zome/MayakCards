import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RequireAdmin from '../components/RequireAdmin';
import CardForm from '../components/CardForm';
import { useTests } from '../context/TestsContext';
import { fetchGames } from '../lib/games';
import { uid } from '../lib/id';
import type { Card, GameData, Test } from '../types';

function emptyCard(): Card {
  return {
    id: uid('card'),
    topic: '',
    question: '',
    description: '',
    photo: '',
    type: 'single',
    points: 1,
    options: [
      { id: uid('opt'), text: 'Вариант 1', correct: true },
      { id: uid('opt'), text: 'Вариант 2', correct: false },
    ],
    linkedGames: [],
  };
}

function AdminEditorInner() {
  const { id } = useParams();
  const { getTest, saveTest, createTest } = useTests();
  const navigate = useNavigate();
  const existing = id ? getTest(id) : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shuffle, setShuffle] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [games, setGames] = useState<GameData[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (id && !existing) {
      setReady(true);
      return;
    }
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? '');
      setShuffle(existing.shuffle);
      const mapped = existing.cards.map((c) => ({
        ...c,
        options: c.options ? [...c.options] : [],
      }));
      setCards(mapped.length ? mapped : [emptyCard()]);
    } else {
      setTitle('Новый тест');
      setDescription('');
      setShuffle(false);
      setCards([emptyCard()]);
    }
    setReady(true);
  }, [id, existing]);

  function updateCard(index: number, card: Card) {
    setCards((prev) => prev.map((c, i) => (i === index ? card : c)));
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function moveCard(index: number, dir: -1 | 1) {
    setCards((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    if (existing) {
      const updated: Test = {
        ...existing,
        title: title.trim() || 'Без названия',
        description,
        shuffle,
        cards,
        updatedAt: now,
      };
      saveTest(updated);
    } else {
      const created = createTest({
        title: title.trim() || 'Без названия',
        description,
        shuffle,
        cards,
      });
      navigate(`/admin/edit/${created.id}`, { replace: true });
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  if (!ready) return <p className="empty">Загрузка…</p>;

  if (id && !existing) {
    return (
      <section>
        <p className="empty">Тест не найден</p>
        <Link className="btn" to="/admin/tests">
          К списку
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Редактор теста
        </h1>
        <Link className="btn btn--ghost btn--sm" to="/admin/tests">
          К списку
        </Link>
      </div>

      <form className="stack" onSubmit={onSave}>
        <div className="editor-card">
          <div className="field">
            <label>Название</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Описание</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
            />
            Случайный порядок карточек при прохождении
          </label>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 className="page-title" style={{ fontSize: '1.15rem', marginBottom: 0 }}>
            Карточки ({cards.length})
          </h2>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => setCards((prev) => [...prev, emptyCard()])}
          >
            + карточка
          </button>
        </div>

        <div className="editor-layout">
          {cards.map((card, index) => (
            <div key={card.id} className="stack">
              <div className="row">
                <span className="meta-chip">#{index + 1}</span>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  disabled={index === 0}
                  onClick={() => moveCard(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  disabled={index === cards.length - 1}
                  onClick={() => moveCard(index, 1)}
                >
                  ↓
                </button>
              </div>
              <CardForm
                card={card}
                games={games}
                onChange={(c) => updateCard(index, c)}
                onRemove={() => removeCard(index)}
              />
            </div>
          ))}
        </div>

        {savedFlash && (
          <p className="banner banner--ok">Сохранено локально. Не забудьте экспортировать JSON для публикации.</p>
        )}

        <div className="row">
          <button className="btn" type="submit">
            Сохранить
          </button>
          <Link className="btn btn--ghost" to="/admin/tests">
            Отмена
          </Link>
        </div>
      </form>
    </section>
  );
}

export default function AdminEditorPage() {
  return (
    <RequireAdmin>
      <AdminEditorInner />
    </RequireAdmin>
  );
}
