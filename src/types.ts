export interface UserStats {
  uid: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: any;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Topic {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  questions: Question[];
  flashcards: Flashcard[];
  createdAt: any;
}

export interface Attempt {
  id: string;
  userId: string;
  topicId: string;
  score: number;
  total: number;
  xpEarned: number;
  date: any;
}
