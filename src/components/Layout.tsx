import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand">
            <img className="brand__mark" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            <span className="brand__text">
              Mayak<span className="brand__accent">Cards</span>
            </span>
          </NavLink>
          <nav className="site-nav" aria-label="Основная навигация">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Тесты
            </NavLink>
            <NavLink to="/study" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Изучение
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Маяк Арена ·{' '}
          <a href="https://mayakarena.ru/" target="_blank" rel="noreferrer">
            mayakarena.ru
          </a>
        </p>
      </footer>
    </div>
  );
}
