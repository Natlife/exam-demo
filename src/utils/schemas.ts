import * as Yup from "yup";

export const SourceSchema = Yup.object().shape({
  id: Yup.string().required(),
  type: Yup.number().oneOf([0, 1, 2, 3]).optional(),
  source: Yup.string().optional(),
  subContent: Yup.string().nullable().optional(),
  totalPlayed: Yup.number().nullable().optional(),
});

export const AnswerSchema = Yup.object().shape({
  id: Yup.string().required(),
  content: Yup.array()
    .of(SourceSchema)
    .min(1, "Nội dung đáp án không được trống"),
  isCorrect: Yup.number().oneOf([0, 1]).optional(),
});

export const QuestionSchema = Yup.object().shape({
  id: Yup.string().required(),
  serialNumber: Yup.number().optional(),
  type: Yup.number().oneOf([0, 1, 2, 3]).required("Loại câu hỏi là bắt buộc"),
  content: Yup.array()
    .of(SourceSchema)
    .min(1, "Nội dung câu hỏi không được trống"),
  note: Yup.string().trim().max(500, "Ghi chú tối đa 500 ký tự").nullable(),
  explanation: Yup.string()
    .trim()
    .max(500, "Giải thích tối đa 500 ký tự")
    .nullable(),
  score: Yup.number().required("Điểm là bắt buộc").min(1, "Điểm phải >= 1"),
  totalPlayed: Yup.number().optional().default(0),
  answerList: Yup.array().of(AnswerSchema).optional(),
  selectedAnswer: Yup.array().of(AnswerSchema).nullable().optional(),
  review: Yup.string().optional(),
  inputType: Yup.array()
    .of(Yup.number())
    .max(4, "Tối đa 4 loại input")
    .optional(),
  status: Yup.number().optional(),
});

export const QuestionGroupSchema = Yup.object().shape({
  id: Yup.string().required(),
  content: Yup.array().of(SourceSchema).optional(),
  totalPlayed: Yup.number().optional().default(0),
  questionList: Yup.array()
    .of(QuestionSchema)
    .min(1, "Phải có ít nhất 1 câu hỏi"),
});

export const QuestionGroupListSchema = Yup.object().shape({
  id: Yup.string().required(),
  serialNumber: Yup.number().optional(),
  title: Yup.array().of(SourceSchema).optional(),
  totalPlayed: Yup.number().optional().default(0),
  questionGroup: Yup.array()
    .of(QuestionGroupSchema)
    .min(1, "Phải có ít nhất 1 nhóm câu hỏi"),
});

export const SectionSchema = Yup.object().shape({
  id: Yup.string().required(),
  name: Yup.string().required("Tên phần là bắt buộc"),
  questionGroupList: Yup.array()
    .of(QuestionGroupListSchema)
    .min(1, "Phải có ít nhất 1 nhóm câu hỏi"),
});
