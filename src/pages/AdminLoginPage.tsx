import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, loginAdmin } from '../lib/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/admin/tests';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/tests" replace />;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate(from.startsWith('/admin') ? from : '/admin/tests', { replace: true });
    } else {
      setError('Неверный пароль');
    }
  }

  return (
    <section>
      <div className="login-box">
        <h1 className="page-title" style={{ fontSize: '1.35rem' }}>
          Вход администратора
        </h1>
        <p className="page-sub">Скрытый раздел. Доступ только по паролю.</p>
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="admin-pass">Пароль</label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="banner banner--err">{error}</p>}
          <button className="btn" type="submit">
            Войти
          </button>
        </form>
      </div>
    </section>
  );
}
