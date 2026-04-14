import {
  MATERIAL_TYPE,
  QUESTION_TYPE,
  QuestionGroupRequest,
  QuestionRequest,
  AnswerRequest,
  sourceRequest,
  QuestionGroupListRequest,
} from "@/types/question";

export const createDynamicSource = (materialType: number): sourceRequest => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  type: materialType,
  source: "",
});

export const createAnswer = (
  isCorrect: number,
  materialType: number,
): AnswerRequest => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  content: [createDynamicSource(materialType)],
  isCorrect,
});

export const createQuestion = (
  questionType: number,
  serialNumber: number,
): QuestionRequest => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  serialNumber,
  type: questionType,
  content: [createDynamicSource(MATERIAL_TYPE.TEXT)],
  note: "",
  explanation: "",
  totalPlayed: 0,
  score: 1,
  answerList:
    questionType === QUESTION_TYPE.MCQ
      ? [
          createAnswer(1, MATERIAL_TYPE.TEXT),
          createAnswer(0, MATERIAL_TYPE.TEXT),
          createAnswer(0, MATERIAL_TYPE.TEXT),
          createAnswer(0, MATERIAL_TYPE.TEXT),
        ]
      : [createAnswer(1, MATERIAL_TYPE.TEXT)],
  review: "",
  isNote: false,
  inputType: [MATERIAL_TYPE.TEXT],
  status: 1,
});

export const createQuestionGroup = (
  questionType: number,
  serialNumber: number,
): QuestionGroupRequest => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  serialNumber: serialNumber,
  content: [createDynamicSource(MATERIAL_TYPE.TEXT)],
  totalPlayed: 0,
  questionList: [createQuestion(questionType, 1)],
});

export const createQuestionGroupList = (
  questionType: number,
  serialNumber: number,
): QuestionGroupListRequest => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  serialNumber: serialNumber,
  title: [createDynamicSource(MATERIAL_TYPE.TEXT)],
  totalPlayed: 0,
  questionGroup: [createQuestionGroup(questionType, 1)],
});

export const getQuillModules = (id: string) => ({
  toolbar: { container: `#toolbar-${id}` },
});
