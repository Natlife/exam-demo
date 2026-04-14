import { SelectChangeEvent } from "@mui/material";
import {
  SectionRequest,
  QuestionGroupRequest,
  QuestionRequest,
  sourceRequest,
} from "./question";
import { Ref } from "react";

export interface ExamSetupRequest {
  id?: number | string;
  name: string;
  total: number;
  duration: number;
  sessionId: number;
  totalPlay: number;
  sectionList: SectionRequest[];
  submitDeadline?: string;
}

export interface AssignmentSetupRequest {
  id?: number | string;
  name: string;
  total: number;
  duration: number;
  type: number | string;
  questionType: number | string;
  isShuffle: number;
  inputType: number | null;
  totalPlay: number;
  sessionId: number;
  sectionList: SectionRequest;
}

export interface TaskBlockProps {
  questionGroup: QuestionGroupRequest;
  questionType: number;
  onTaskChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
  ) => void;
  onRemoveQuestion: (qId: string) => void;
  onRemoveAllQuestion: () => void;
  onGetFile: (e: any) => Promise<string | null>;
  onSave: (question: QuestionRequest) => void;
  onAddQuestion: (tId: string) => void;
  errors: any;
  ref?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  setOpenDeleteQuestion?: (open: boolean) => void;
  setSelectedQuestion?: (question: QuestionRequest) => void;
  onIsGroupChange?: (questionGroup: QuestionGroupRequest) => void;
  handleRemoveTitle: (id: string) => void;
  handleRemoveContent: (id: string) => void;
  handleUpdateTitle: (
    id: string,
    field: keyof sourceRequest,
    value: string,
  ) => void;
  handleUpdateContent: (
    id: string,
    field: keyof sourceRequest,
    value: string,
  ) => void;
  reorderTitle: (startIndex: number, endIndex: number) => void;
  reorderContent: (startIndex: number, endIndex: number) => void;
  handleAddNewContent: (type: number) => void;
  handleAddNewTitle: (type: number) => void;
}

export interface QuestionModalProps {
  questionType: number;
  questionData: QuestionRequest | null;
  qIndex: number;
  onSave: (question: QuestionRequest) => void;
  onGetFile: (e: any) => Promise<string | null>;
  errors: any;
  ref?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
}

export interface SourceDisplayProps {
  item: any;
  ref?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd?: () => void;
  isLocked?: boolean;
  assignment?: AssignmentDetail;
  handleTotalPlayedChange?: (id: string) => void;
}

export interface SubmitRequest {
  time: number;
  answerLog: SectionRequest;
}

export interface ExamSubmitRequest {
  time: number;
  answerLog: SectionRequest[];
}

export interface AssignmentDetail {
  id: number;
  name: string;
  total: number;
  inputType: number;
  duration: number;
  questionType: number;
  isShuffle: number;
  totalPlay: number;
  sectionList: SectionRequest;
  submitDeadline?: string;
}

export interface ScoreReportDetail {
  assignmentId: number;
  assignemntLogId: number;
  inputType: number;
  name: string;
  time: number;
  type: number;
  gradingList: SectionRequest;
  score?: number;
  review?: string;
  submitDeadline?: string;
  checkDeadline?: string;
  gradingStatus?: number;
}

export interface ExamScoreReportDetail {
  examId: number | string;
  examLogId: number;
  name: string;
  time: number;
  gradingList: SectionRequest[];
  score?: number;
  review?: string;
  gradingStatus: number;
  submitDeadline?: string;
  checkDeadline?: string;
}

export interface ExamPartReportDetail {
  id: number;
  inputType: number;
  name: string;
  time: number;
  type: number;
  gradingList: SectionRequest;
  score?: number;
  review?: string;
}

export interface ScoreReportStatistic {
  assignmentId?: number;
  examId?: number;
  mcqCount: number;
  essayCount: number;
  total: number;
  time: number;
  rank?: number;
  totalScoreReport?: number;
  assignmentName?: string;
  gradingStatus?: number;
  score?: number;
  questionType?: number;
}

export interface GradingReviewRequest {
  assignmentId?: number;
  score: number;
  review: string;
  questionReviews: QuestionReviewRequest[];
}

export interface ExamGradingReviewRequest {
  examId: number | string;
  score: number;
  review: string;
  sectionList: SectionGradingReviewRequest[];
}

export interface SectionGradingReviewRequest {
  sectionId: number | string;
  questionReviews: QuestionReviewRequest[];
}

export interface QuestionReviewRequest {
  questionId: string;
  review: string;
  gradingLateFlag?: boolean;
  gradedAt?: string;
  isCorrect: boolean | number;
}
