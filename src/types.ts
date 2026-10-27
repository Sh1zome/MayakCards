export type QuestionType = 'single' | 'multiple' | 'text';

export type GameCategory = 'vr' | 'arena' | 'autosim';

export interface AnswerOption {
  id: string;
  text: string;
  correct?: boolean;
}

export interface LinkedGame {
  id: string;
  name: string;
  category?: GameCategory;
}

export interface Card {
  id: string;
  photo?: string;
  description?: string;
  question: string;
  topic: string;
  type: QuestionType;
  options?: AnswerOption[];
  linkedGames?: LinkedGame[];
  points?: number;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  shuffle: boolean;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export type UserAnswer = string | string[];

export interface TestAnswers {
  [cardId: string]: UserAnswer;
}

export interface ScoredCard {
  card: Card;
  userAnswer: UserAnswer | undefined;
  correct: boolean | null;
  correctLabels: string[];
  userLabels: string[];
}

export interface ScoreResult {
  earned: number;
  max: number;
  percent: number;
  autoChecked: ScoredCard[];
  incorrect: ScoredCard[];
  pendingManual: ScoredCard[];
}

export interface GameData {
  id?: string;
  name: string;
  russian: string;
  control: string[];
  violation: string[];
  age: string;
  difficulty: number;
  tags: string[];
  screenshots: string[];
  description: string;
  trailer: string;
  cardHeader: string;
  mobileCardHeader: string;
  category: GameCategory;
  new?: string;
  rdate?: string;
}

export interface GamesFile {
  games: GameData[];
}
