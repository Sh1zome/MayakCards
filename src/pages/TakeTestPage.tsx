import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTests } from '../context/TestsContext';
import { shuffleArray } from '../lib/scoring';
import type { Card, TestAnswers } from '../types';
import GameModal from '../components/GameModal';
import { fetchGames } from '../lib/games';
import type { GameData } from '../types';

export default function TakeTestPage() {
  const { id } = useParams();
  const { getTest, loading } = useTests();
  const navigate = useNavigate();
  const test = id ? getTest(id) : undefined;

  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswers>({});
  const [orderedCards, setOrderedCards] = useState<Card[]>([]);
  const [games, setGames] = useState<GameData[]>([]);
  const [modalGame, setModalGame] = useState<GameData | null>(null);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (!test) return;
    setOrderedCards(test.shuffle ? shuffleArray(test.cards) : [...test.cards]);
    setIndex(0);
    setAnswers({});
    setStarted(false);
  }, [test]);

  const card = orderedCards[index];
  const progress = orderedCards.length
    ? ((index + (started ? 0 : 0)) / orderedCards.length) * 100
    : 0;

  const currentAnswer = card ? answers[card.id] : undefined;

  const canGoNext = useMemo(() => {
    if (!card) return false;
    if (card.type === 'text') {
      return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
    }
    if (card.type === 'multiple') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return typeof currentAnswer === 'string' && currentAnswer.length > 0;
  }, [card, currentAnswer]);

  function start(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!orderedCards.length) return;
    setStarted(true);
  }

  function setSingle(optionId: string) {
    if (!card) return;
    setAnswers((prev) => ({ ...prev, [card.id]: optionId }));
  }

  function toggleMulti(optionId: string) {
    if (!card) return;
    const prev = Array.isArray(answers[card.id]) ? [...(answers[card.id] as string[])] : [];
    const next = prev.includes(optionId)
      ? prev.filter((x) => x !== optionId)
      : [...prev, optionId];
    setAnswers((a) => ({ ...a, [card.id]: next }));
  }

  function setText(value: string) {
    if (!card) return;
    setAnswers((prev) => ({ ...prev, [card.id]: value }));
  }

  function openLinkedGame(gameId: string, gameName: string) {
    const found =
      games.find((g) => g.id === gameId) ||
      games.find((g) => g.name === gameName);
    if (found) setModalGame(found);
    else setModalGame({
      name: gameName,
      russian: '',
      control: [],
      violation: [],
      age: '',
      difficulty: 0,
      tags: [],
      screenshots: [],
      description: 'Подробности смотрите в каталоге Mayak-GameList.',
      trailer: '',
      cardHeader: '',
      mobileCardHeader: '',
      category: 'vr',
      id: gameId,
    });
  }

  function finish() {
    if (!test) return;
    navigate(`/test/${test.id}/results`, {
      state: { answers, participantName: name.trim(), cardOrder: orderedCards.map((c) => c.id) },
    });
  }

  function next() {
    if (index >= orderedCards.length - 1) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  }

  if (loading) return <p className="empty">Загрузка…</p>;
  if (!test) {
    return (
      <section>
        <p className="empty">Тест не найден.</p>
        <Link className="btn btn--ghost" to="/">К списку</Link>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="stack" style={{ maxWidth: 480 }}>
        <h1 className="page-title">{test.title}</h1>
        <p className="page-sub">{test.description || 'Перед стартом укажите своё имя.'}</p>
        <form className="stack" onSubmit={start}>
          <div className="field">
            <label htmlFor="name">Ваше имя</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              required
              autoFocus
            />
          </div>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Вопросов: {test.cards.length}
            {test.shuffle ? ' · порядок случайный' : ''}
          </p>
          <div className="row">
            <button className="btn" type="submit" disabled={!test.cards.length}>
              Начать тест
            </button>
            <Link className="btn btn--ghost" to="/">Назад</Link>
          </div>
        </form>
      </section>
    );
  }

  if (!card) {
    return <p className="empty">В тесте нет карточек.</p>;
  }

  return (
    <section>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="meta-chip">
          {index + 1} / {orderedCards.length}
        </span>
        <span className="meta-chip">{name}</span>
      </div>
      <div className="quiz-progress" aria-hidden>
        <div
          className="quiz-progress__bar"
          style={{ width: `${((index + 1) / orderedCards.length) * 100 || progress}%` }}
        />
      </div>

      <article className="quiz-card">
        {card.photo && (
          <div className="quiz-card__photo">
            <img src={card.photo} alt="" />
          </div>
        )}
        <div className="quiz-card__body">
          <span className="topic-badge">{card.topic || 'Без темы'}</span>
          <h2 className="quiz-question">{card.question}</h2>
          {card.description && <p className="quiz-desc">{card.description}</p>}

          {card.linkedGames && card.linkedGames.length > 0 && (
            <div className="game-chips">
              {card.linkedGames.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="game-chip"
                  onClick={() => openLinkedGame(g.id, g.name)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {(card.type === 'single' || card.type === 'multiple') && (
            <div className="options-list">
              {(card.options ?? []).map((opt) => {
                const selected =
                  card.type === 'single'
                    ? currentAnswer === opt.id
                    : Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`option-btn${selected ? ' selected' : ''}`}
                    onClick={() =>
                      card.type === 'single' ? setSingle(opt.id) : toggleMulti(opt.id)
                    }
                  >
                    {opt.text}
                  </button>
                );
              })}
              {card.type === 'multiple' && (
                <p className="page-sub" style={{ marginBottom: 0 }}>Можно выбрать несколько вариантов</p>
              )}
            </div>
          )}

          {card.type === 'text' && (
            <div className="field">
              <label htmlFor="text-answer">Ваш ответ</label>
              <textarea
                id="text-answer"
                value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите ответ…"
              />
            </div>
          )}

          <div className="row">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Назад
            </button>
            <button type="button" className="btn" disabled={!canGoNext} onClick={next}>
              {index >= orderedCards.length - 1 ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
      </article>

      {modalGame && <GameModal game={modalGame} onClose={() => setModalGame(null)} />}
    </section>
  );
}
