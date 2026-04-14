import React, { memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { Trash } from "iconsax-reactjs";
import { QUESTION_TYPE, QuestionRequest } from "@/types/question";
import { QuestionModal, QUESTION_TYPE_CONFIG } from "./QuestionModal";
import { AnswerModal } from "./AnswerModal";
import { Box } from "@mui/material";

interface QuestionAccordionItemProps {
  question: QuestionRequest;
  questionType: number;
  qIndex: number;
  onSave: (question: QuestionRequest) => void;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  errors?: Record<string, string>;
  onRequestDelete: (question: QuestionRequest) => void;
  isExam?: boolean;
}

export const QuestionAccordionItem = memo<QuestionAccordionItemProps>(
  ({
    question,
    questionType,
    qIndex,
    onSave,
    onGetFile,
    errors,
    onRequestDelete,
    isExam,
  }) => (
    <Accordion
      sx={{
        "&:before": { display: "none" },
        borderBottom: "1px solid #e0e0e0",
        "&.Mui-expanded": { borderBottom: "1px solid #e0e0e0" },
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <AccordionSummary>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            {question.type !== QUESTION_TYPE.SOURCE_ONLY &&
            question.serialNumber !== 0 ? (
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Câu {question.serialNumber}
              </Typography>
            ) : (
              question.type === QUESTION_TYPE.SOURCE_ONLY && (
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Đề bài
                </Typography>
              )
            )}
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              color: "text.disabled",
              cursor: "pointer",
              "&:hover": { color: "error.main" },
              transition: "color 0.2s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(question);
            }}
          >
            <Trash size={18} />
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 1.5 }}>
        <Stack spacing={1}>
          <QuestionModal
            onGetFile={onGetFile}
            questionType={questionType}
            questionData={question}
            qIndex={qIndex}
            onSave={onSave}
            errors={errors}
            isExam={isExam}
          />

          <AnswerModal
            questionType={questionType}
            questionData={question}
            qIndex={qIndex}
            onSave={onSave}
            onGetFile={onGetFile}
            errors={errors}
            isExam={isExam}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  ),
);

QuestionAccordionItem.displayName = "QuestionAccordionItem";
