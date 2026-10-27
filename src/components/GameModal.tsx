import type { GameData } from '../types';
import { categoryLabel, GAMELIST_SITE, gameCover } from '../lib/games';

interface Props {
  game: GameData;
  onClose: () => void;
}

export default function GameModal({ game, onClose }: Props) {
  const cover = gameCover(game);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        {cover && (
          <div className="game-modal__cover">
            <img src={cover} alt="" />
          </div>
        )}
        <span className="meta-chip">{categoryLabel(game.category)}</span>
        <h2 className="game-modal__title">{game.name}</h2>
        {game.description && <p className="game-modal__desc">{game.description}</p>}
        <dl className="game-meta">
          <div>
            <dt>Русский</dt>
            <dd>{game.russian || '—'}</dd>
          </div>
          <div>
            <dt>Возраст</dt>
            <dd>{game.age || '—'}</dd>
          </div>
          <div>
            <dt>Сложность</dt>
            <dd>{game.difficulty ?? '—'}</dd>
          </div>
          <div>
            <dt>Управление</dt>
            <dd>{game.control?.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt>Ограничения</dt>
            <dd>{game.violation?.filter(Boolean).join(', ') || '—'}</dd>
          </div>
          <div>
            <dt>Теги</dt>
            <dd>{game.tags?.join(', ') || '—'}</dd>
          </div>
        </dl>
        <a className="btn btn--ghost" href={GAMELIST_SITE} target="_blank" rel="noreferrer">
          Открыть Mayak-GameList
        </a>
      </div>
    </div>
  );
}
