import { ChangeEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTests } from '../context/TestsContext';
import { logoutAdmin } from '../lib/auth';
import RequireAdmin from '../components/RequireAdmin';

function AdminListInner() {
  const {
    tests,
    usingOverride,
    createTest,
    deleteTest,
    exportJson,
    importJson,
    clearOverride,
  } = useTests();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  function onCreate() {
    const t = createTest({
      title: 'Новый тест',
      cards: [],
    });
    navigate(`/admin/edit/${t.id}`);
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importJson(text);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      e.target.value = '';
    }
  }

  function onDelete(id: string, title: string) {
    if (confirm(`Удалить тест «${title}»?`)) deleteTest(id);
  }

  function onLogout() {
    logoutAdmin();
    navigate('/admin');
  }

  return (
    <section>
      <h1 className="page-title">Админ · тесты</h1>
      <p className="page-sub">
        Правки сохраняются локально. Чтобы опубликовать для всех — экспортируйте JSON и замените{' '}
        <code>public/tests.json</code> в репозитории, затем задеплойте.
      </p>

      {usingOverride && (
        <p className="banner banner--info" style={{ marginBottom: '1rem' }}>
          Используется локальный черновик (localStorage).{' '}
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => void clearOverride()}>
            Сбросить к published tests.json
          </button>
        </p>
      )}

      <div className="admin-bar">
        <button type="button" className="btn" onClick={onCreate}>
          Создать тест
        </button>
        <button type="button" className="btn btn--ghost" onClick={exportJson}>
          Экспорт JSON
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
          Импорт JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onImport}
        />
        <button type="button" className="btn btn--ghost" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <div className="stack">
        {tests.length === 0 && <p className="empty">Тестов пока нет — создайте первый.</p>}
        {tests.map((test) => (
          <div key={test.id} className="admin-test-row">
            <div>
              <strong>{test.title}</strong>
              <div className="page-sub" style={{ marginBottom: 0 }}>
                {test.cards.length} карт. · обновлён{' '}
                {new Date(test.updatedAt).toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="row">
              <Link className="btn btn--sm" to={`/admin/edit/${test.id}`}>
                Редактировать
              </Link>
              <Link className="btn btn--sm btn--ghost" to={`/test/${test.id}`}>
                Открыть
              </Link>
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={() => onDelete(test.id, test.title)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminListPage() {
  return (
    <RequireAdmin>
      <AdminListInner />
    </RequireAdmin>
  );
}
