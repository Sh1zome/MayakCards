import type { Card, ScoreResult, ScoredCard, TestAnswers, UserAnswer } from '../types';

function optionLabels(card: Card, ids: string[]): string[] {
  const opts = card.options ?? [];
  return ids
    .map((id) => opts.find((o) => o.id === id)?.text ?? id)
    .filter(Boolean);
}

function normalizeIds(answer: UserAnswer | undefined): string[] {
  if (answer == null) return [];
  if (Array.isArray(answer)) return [...answer].sort();
  if (typeof answer === 'string' && answer !== '') return [answer];
  return [];
}

function scoreCard(card: Card, userAnswer: UserAnswer | undefined): ScoredCard {
  if (card.type === 'text') {
    const text = typeof userAnswer === 'string' ? userAnswer : '';
    return {
      card,
      userAnswer,
      correct: null,
      correctLabels: [],
      userLabels: text ? [text] : [],
    };
  }

  const correctIds = (card.options ?? [])
    .filter((o) => o.correct)
    .map((o) => o.id)
    .sort();
  const userIds = normalizeIds(userAnswer);
  const correct =
    correctIds.length === userIds.length &&
    correctIds.every((id, i) => id === userIds[i]);

  return {
    card,
    userAnswer,
    correct,
    correctLabels: optionLabels(card, correctIds),
    userLabels: optionLabels(card, userIds),
  };
}

export function scoreTest(cards: Card[], answers: TestAnswers): ScoreResult {
  const autoChecked: ScoredCard[] = [];
  const incorrect: ScoredCard[] = [];
  const pendingManual: ScoredCard[] = [];
  let earned = 0;
  let max = 0;

  for (const card of cards) {
    const scored = scoreCard(card, answers[card.id]);
    if (card.type === 'text') {
      pendingManual.push(scored);
      continue;
    }
    const pts = card.points ?? 1;
    max += pts;
    autoChecked.push(scored);
    if (scored.correct) {
      earned += pts;
    } else {
      incorrect.push(scored);
    }
  }

  const percent = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { earned, max, percent, autoChecked, incorrect, pendingManual };
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
