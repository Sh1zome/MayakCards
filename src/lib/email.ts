import type { ScoreResult, Test } from '../types';

const RESULT_EMAIL = 'artemg.sadovnikovg.2004g@gmail.com';

function formatResultBody(
  test: Test,
  participantName: string,
  score: ScoreResult,
): string {
  const lines: string[] = [
    `Тест: ${test.title}`,
    `Участник: ${participantName}`,
    `Автоматический балл: ${score.earned} / ${score.max} (${score.percent}%)`,
    '',
  ];

  if (score.incorrect.length) {
    lines.push('Неверные ответы:');
    for (const item of score.incorrect) {
      lines.push(`— [${item.card.topic}] ${item.card.question}`);
      lines.push(`  Ответ: ${item.userLabels.join(', ') || '—'}`);
      lines.push(`  Верно: ${item.correctLabels.join(', ') || '—'}`);
    }
    lines.push('');
  }

  if (score.pendingManual.length) {
    lines.push('Текстовые ответы (ручная проверка):');
    for (const item of score.pendingManual) {
      lines.push(`— [${item.card.topic}] ${item.card.question}`);
      lines.push(`  Ответ: ${item.userLabels.join(' ') || '—'}`);
    }
    lines.push('');
  }

  lines.push(`Дата: ${new Date().toLocaleString('ru-RU')}`);
  return lines.join('\n');
}

/**
 * Отправка через FormToMail (formtomail.ru) — российский сервис.
 * Нужен VITE_FORMTOMAIL_API_KEY из кабинета https://formtomail.ru
 */
export async function sendResultEmail(
  test: Test,
  participantName: string,
  score: ScoreResult,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = import.meta.env.VITE_FORMTOMAIL_API_KEY as string | undefined;
  if (!apiKey) {
    return {
      ok: false,
      error:
        'Не задан VITE_FORMTOMAIL_API_KEY. Зарегистрируйтесь на formtomail.ru и добавьте ключ в .env',
    };
  }

  const message = formatResultBody(test, participantName, score);

  try {
    const res = await fetch('https://api.formtomail.ru/send', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        to: RESULT_EMAIL,
        title: `Результат теста: ${test.title} — ${participantName}`,
        body: {
          Участник: participantName,
          Тест: test.title,
          Баллы: `${score.earned} / ${score.max} (${score.percent}%)`,
          Результат: message,
        },
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | { statusCode?: number; message?: string }
      | null;

    if (!res.ok || (data?.statusCode && data.statusCode >= 400)) {
      return {
        ok: false,
        error: data?.message || `HTTP ${res.status}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Ошибка отправки' };
  }
}
