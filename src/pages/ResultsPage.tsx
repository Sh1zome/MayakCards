import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTests } from '../context/TestsContext';
import { scoreTest } from '../lib/scoring';
import { sendResultEmail } from '../lib/email';
import type { GameData, TestAnswers } from '../types';
import GameModal from '../components/GameModal';
import { fetchGames } from '../lib/games';

interface LocationState {
  answers?: TestAnswers;
  participantName?: string;
  cardOrder?: string[];
}

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const { getTest, loading } = useTests();
  const test = id ? getTest(id) : undefined;

  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [emailError, setEmailError] = useState('');
  const [games, setGames] = useState<GameData[]>([]);
  const [modalGame, setModalGame] = useState<GameData | null>(null);
  const emailSentRef = useRef(false);

  const cards = useMemo(() => {
    if (!test) return [];
    if (state.cardOrder?.length) {
      return state.cardOrder
        .map((cid) => test.cards.find((c) => c.id === cid))
        .filter(Boolean) as typeof test.cards;
    }
    return test.cards;
  }, [test, state.cardOrder]);

  const score = useMemo(() => {
    if (!test || !state.answers) return null;
    return scoreTest(cards.length ? cards : test.cards, state.answers);
  }, [test, cards, state.answers]);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (!test || !score || !state.participantName || !state.answers) return;
    if (emailSentRef.current) return;
    emailSentRef.current = true;
    setEmailStatus('sending');
    sendResultEmail(test, state.participantName, score).then((res) => {
      if (res.ok) setEmailStatus('ok');
      else {
        setEmailStatus('err');
        setEmailError(res.error || 'Не удалось отправить');
      }
    });
  }, [test, score, state.participantName, state.answers]);

  function openGame(gameId: string, gameName: string) {
    const found =
      games.find((g) => g.id === gameId) || games.find((g) => g.name === gameName);
    setModalGame(
      found || {
        id: gameId,
        name: gameName,
        russian: '',
        control: [],
        violation: [],
        age: '',
        difficulty: 0,
        tags: [],
        screenshots: [],
        description: 'Смотрите карточку в Mayak-GameList.',
        trailer: '',
        cardHeader: '',
        mobileCardHeader: '',
        category: 'vr',
      },
    );
  }

  if (loading) return <p className="empty">Загрузка…</p>;

  if (!test || !score || !state.answers || !state.participantName) {
    return (
      <section>
        <p className="empty">Нет данных результата. Пройдите тест заново.</p>
        <Link className="btn" to={test ? `/test/${test.id}` : '/'}>
          К тесту
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className="page-title">Результат</h1>
      <p className="page-sub">
        {test.title} · {state.participantName}
      </p>

      <div className="results-hero">
        <div className="results-score">
          {score.earned} / {score.max}
        </div>
        <p>
          {score.percent}% по автоматически проверяемым вопросам
          {score.pendingManual.length > 0
            ? ` · ${score.pendingManual.length} текстовых — на ручной проверке`
            : ''}
        </p>
        {emailStatus === 'sending' && (
          <p className="banner banner--info" style={{ marginTop: '1rem' }}>
            Отправка результата на почту…
          </p>
        )}
        {emailStatus === 'ok' && (
          <p className="banner banner--ok" style={{ marginTop: '1rem' }}>
            Результат отправлен администратору
          </p>
        )}
        {emailStatus === 'err' && (
          <p className="banner banner--err" style={{ marginTop: '1rem' }}>
            Не удалось отправить письмо: {emailError}
          </p>
        )}
      </div>

      {score.incorrect.length > 0 && (
        <div className="stack" style={{ marginBottom: '1.5rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.2rem' }}>
            Неверные ответы
          </h2>
          {score.incorrect.map((item) => (
            <article key={item.card.id} className="results-item wrong">
              <span className="topic-badge">{item.card.topic}</span>
              <h3 className="quiz-question" style={{ fontSize: '1rem' }}>
                {item.card.question}
              </h3>
              <div className="answer-pair">
                <div>
                  <span>Ваш ответ: </span>
                  <strong className="bad">{item.userLabels.join(', ') || '—'}</strong>
                </div>
                <div>
                  <span>Правильно: </span>
                  <strong className="ok">{item.correctLabels.join(', ') || '—'}</strong>
                </div>
              </div>
              {item.card.linkedGames && item.card.linkedGames.length > 0 && (
                <div className="game-chips">
                  {item.card.linkedGames.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className="game-chip"
                      onClick={() => openGame(g.id, g.name)}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {score.pendingManual.length > 0 && (
        <div className="stack" style={{ marginBottom: '1.5rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.2rem' }}>
            На проверке
          </h2>
          {score.pendingManual.map((item) => (
            <article key={item.card.id} className="results-item pending">
              <span className="topic-badge">{item.card.topic}</span>
              <h3 className="quiz-question" style={{ fontSize: '1rem' }}>
                {item.card.question}
              </h3>
              <div className="answer-pair">
                <div>
                  <span>Ваш ответ: </span>
                  <strong>{item.userLabels.join(' ') || '—'}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {score.incorrect.length === 0 && score.pendingManual.length === 0 && (
        <p className="banner banner--ok" style={{ marginBottom: '1.25rem' }}>
          Все автоматически проверяемые ответы верны.
        </p>
      )}

      <div className="row">
        <Link className="btn" to="/">
          К списку тестов
        </Link>
        <Link className="btn btn--ghost" to={`/test/${test.id}`}>
          Пройти ещё раз
        </Link>
      </div>

      {modalGame && <GameModal game={modalGame} onClose={() => setModalGame(null)} />}
    </section>
  );
}
