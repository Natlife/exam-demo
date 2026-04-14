import React, { memo } from "react";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import {
  QuestionGroupListRequest,
  QuestionGroupRequest,
  QuestionRequest,
  sourceRequest,
} from "@/types/question";
import { EditorHeader } from "../editor/EditorHeader";
import { EditorContent } from "../editor/EditorContent";
import { QuestionAccordionItem } from "./QuestionItem";
import { Trash } from "iconsax-reactjs";

export interface SourceListHandlers {
  update: (id: string, field: keyof sourceRequest, value: string) => void;
  remove: (id: string) => void;
  add: (type: number) => void;
  reorder: (startIndex: number, endIndex: number) => void;
}

interface TaskBlockProps {
  questionGroupList: QuestionGroupListRequest;
  questionType: number;
  onSaveQuestion: (groupIndex: number, question: QuestionRequest) => void;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<any>;
  onAddQuestion: (groupIndex: number) => void;
  onSerialNumberChange: (value: number) => void;
  errors?: Record<string, string>;
  titleHandlers: SourceListHandlers;
  getContentHandlers: (groupIndex: number) => SourceListHandlers;
  onRequestDeleteQuestion: (
    groupIndex: number,
    question: QuestionRequest,
  ) => void;
  onAddGroup: () => void;
  onRequestDeleteGroup?: (groupIndex: number) => void;
  onFormatSerialNumbers: (groupIndex: number) => void;
  isExam?: boolean;
}

export const TaskBlock = memo<TaskBlockProps>(
  ({
    questionGroupList,
    questionType,
    onSaveQuestion,
    onGetFile,
    onAddQuestion,
    onSerialNumberChange,
    errors,
    titleHandlers,
    getContentHandlers,
    onRequestDeleteQuestion,
    onAddGroup,
    onRequestDeleteGroup,
    onFormatSerialNumbers,
    isExam,
  }) => (
    <Grid container size={12}>
      <Grid size={12}>
        <Box sx={{ mb: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.disabled"
                sx={{ textTransform: "uppercase" }}
              >
                Số thứ tự
              </Typography>

              <TextField
                type="number"
                size="small"
                value={questionGroupList.serialNumber}
                onChange={(e) =>
                  onSerialNumberChange(parseInt(e.target.value) || 0)
                }
                sx={{
                  width: 100,
                  "& .MuiOutlinedInput-root": {
                    fontWeight: "bold",
                    color: "primary.main",
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Grid>

      <Grid size={12}>
        <EditorHeader
          headerItems={questionGroupList.title}
          updateHeaderItem={titleHandlers.update}
          removeHeaderItem={titleHandlers.remove}
          addHeaderItem={titleHandlers.add}
          reorderHeaderItems={titleHandlers.reorder}
          handleFileChange={onGetFile}
        />
      </Grid>

      <Grid size={12} sx={{ mt: 1 }}>
        {questionGroupList.questionGroup.map(
          (group: QuestionGroupRequest, groupIndex: number) => {
            const contentHandlers = getContentHandlers(groupIndex);

            return (
              <Accordion
                key={group.id}
                defaultExpanded
                sx={{
                  "&:before": { display: "none" },
                  border: "1px solid #e0e0e0",
                  mb: 1,
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
                      <Typography variant="h5">
                        Nhóm câu hỏi {groupIndex + 1}
                      </Typography>
                    </Stack>

                    {onRequestDeleteGroup &&
                      questionGroupList.questionGroup.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestDeleteGroup(groupIndex);
                          }}
                          size="small"
                        >
                          <Trash />
                        </IconButton>
                      )}
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ backgroundColor: "#FAFAFA" }}>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, lg: 6 }}>
                      <EditorContent
                        contentItems={group.content}
                        updateContentItem={contentHandlers.update}
                        removeContentItem={contentHandlers.remove}
                        addContentItem={contentHandlers.add}
                        reorderContentItems={contentHandlers.reorder}
                        handleFileChange={onGetFile}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                      <Stack direction="row" justifyContent="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFormatSerialNumbers(groupIndex);
                          }}
                          sx={{
                            fontSize: "0.65rem",
                            mb: 1,
                            color: "primary.main",
                            borderColor: "primary.light",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "primary.lighter",
                            },
                          }}
                        >
                          Format STT
                        </Button>
                      </Stack>
                      <Stack spacing={1}>
                        {group.questionList.map(
                          (q: QuestionRequest, qIndex: number) => (
                            <QuestionAccordionItem
                              key={q.id}
                              question={q}
                              questionType={questionType}
                              qIndex={qIndex}
                              onSave={(updatedQuestion) =>
                                onSaveQuestion(groupIndex, updatedQuestion)
                              }
                              onGetFile={onGetFile}
                              errors={errors}
                              onRequestDelete={(qToDelete) =>
                                onRequestDeleteQuestion(groupIndex, qToDelete)
                              }
                              isExam={isExam}
                            />
                          ),
                        )}
                      </Stack>

                      <IconButton
                        sx={{
                          width: "40%",
                          mt: 1,
                          display: "flex",
                          justifyContent: "flex-start",
                          color: "orangered",
                        }}
                        onClick={() => onAddQuestion(groupIndex)}
                      >
                        <FormattedMessage id="add-small-question" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          },
        )}
      </Grid>

      <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          sx={{ borderColor: "orangered", color: "orangered" }}
          onClick={onAddGroup}
        >
          Thêm nhóm câu hỏi
        </Button>
      </Box>
    </Grid>
  ),
);

TaskBlock.displayName = "TaskBlock";
