import { Link } from 'react-router-dom';
import { useTests } from '../context/TestsContext';

export default function TestsPage() {
  const { tests, loading } = useTests();

  return (
    <section>
      <h1 className="page-title">Тесты</h1>
      <p className="page-sub">Выберите тест для прохождения. Результаты уйдут администратору на почту.</p>

      {loading && <p className="empty">Загрузка…</p>}

      {!loading && tests.length === 0 && (
        <p className="empty">Пока нет опубликованных тестов.</p>
      )}

      <div className="tests-grid">
        {tests.map((test) => (
          <article key={test.id} className="test-tile">
            <div className="row">
              <span className="meta-chip">{test.cards.length} карт.</span>
              {test.shuffle && <span className="meta-chip">рандом</span>}
            </div>
            <h3>{test.title}</h3>
            <p>{test.description || 'Без описания'}</p>
            <Link className="btn" to={`/test/${test.id}`}>
              Начать
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
