export enum MATERIAL_TYPE {
  TEXT = 0,
  IMAGE = 1,
  AUDIO = 2,
  VIDEO = 3,
}

export enum QUESTION_TYPE {
  MCQ = 0,
  FILL = 1,
  ESSAY = 2,
  SOURCE_ONLY = 3,
}

export enum GRADING_STATUS {
  PENDING = 0,
  MCQ_ONLY = 1,
  COMPLETED = 2,
  LATE = 3,
  INPROGRESS = 4,
}

export interface SectionRequest {
  id: string | number;
  name: string;
  questionGroupList: QuestionGroupListRequest[];
}

export interface QuestionGroupListRequest {
  id: string;
  serialNumber: number;
  title: sourceRequest[];
  totalPlayed: number;
  questionGroup: QuestionGroupRequest[];
}

export interface QuestionGroupRequest {
  id: string;
  serialNumber: number;
  content: sourceRequest[];
  totalPlayed: number;
  questionList: QuestionRequest[];
}

export interface sourceRequest {
  id: string;
  type: MATERIAL_TYPE;
  source: string;
  subContent?: string;
}

export interface QuestionRequest {
  id: string;
  serialNumber: number;
  type: QUESTION_TYPE;
  content: sourceRequest[];
  note?: string;
  gradingExplanation?: string;
  explanation?: string;
  totalPlayed: number;
  score: number;
  answerList: AnswerRequest[];
  selectedAnswer?: AnswerRequest[];
  review: string;
  gradingLateFlag?: boolean;
  gradedAt?: string;
  lateFlag?: boolean;
  isNote: boolean;
  createdAt?: string;
  isMultipleChoice?: boolean;
  inputType: MATERIAL_TYPE[];
  status?: number;
}

export interface AnswerRequest {
  id: string;
  content: sourceRequest[];
  isCorrect?: number;
}

export type ViewState = "parts-list" | "quiz-list" | "editor" | "preview-all";
