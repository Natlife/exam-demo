
export type MediaType = 'text' | 'audio' | 'video' | 'image';
export type QuestionType = 'mcq' | 'fill-blank' | 'essay' | 'data';

export interface Option {
  id: string;
  label: string;
  type: MediaType;
  value: string;
  description?: string;
}

export interface SubQuestion {
  id: string;
  label: string;
  type: QuestionType;
  questionItems: MediaItem[];
  prompt?: string;
  options: Option[];
  correctOptionId?: string;
  answer: string;
  explanation: string;
  allowedAnswerTypes?: MediaType[]; // For essay questions
  showOutlineInput?: boolean; // For essay questions
}

export interface MediaItem {
  id: string;
  type: MediaType;
  value: string;
}

export interface QuestionGroup {
  id: string;
  contentItems: MediaItem[];
  questions: SubQuestion[];
}

export interface Quiz {
  id: string;
  title: string;
  order: number;
  timeLimit?: number; // in minutes
  headerItems: MediaItem[];
  questionGroups: QuestionGroup[];
  createdAt: number;
  updatedAt: number;
  partId?: string;
  subQuizzes?: Quiz[]; // For virtual quizzes (all quizzes in a part)
}

export interface Part {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export type ViewState = 'parts-list' | 'quiz-list' | 'editor' | 'preview-all' | 'do-quiz' | 'grade-quiz';
