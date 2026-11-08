export interface Category {
  title: string;
  items: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'; // easy: yellow, medium: green, hard: blue, expert: purple
}

export interface DailyPuzzle {
  id: string;
  dayNumber: number;
  date: string;
  categories: Category[];
}

export interface ClientPuzzleData {
  id: string;
  dayNumber: number;
  date: string;
  items: string[]; // Shuffled, category associations stripped
}

export interface GuessRequest {
  guess: string[]; // 4 items
}

export interface GuessResponse {
  correct: boolean;
  categoryTitle?: string;
  categoryDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  solvedItems?: string[];
  remainingAttempts: number;
  solvedAll: boolean;
  message?: string;
}

export interface UserProfile {
  streak: number;
  maxStreak: number;
  totalSolves: number;
  shields: number;
  playedToday: boolean;
}

export interface FulfillOrderRequest {
  orderId: string;
  sku: string;
  userId: string;
}
