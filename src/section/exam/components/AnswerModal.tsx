import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { Add, ExportCurve, Trash } from "iconsax-reactjs";
import {
  AnswerRequest,
  MATERIAL_TYPE,
  QUESTION_TYPE,
  QuestionRequest,
  sourceRequest,
} from "@/types/question";
import { createAnswer, createDynamicSource } from "@/utils/QuestionFactory";
import { RichTextEditor } from "@/components/RickTextEditor";
import { ConfirmDialog } from "@/components/ConfirmPopup";

interface AnswerModalProps {
  questionType: number;
  questionData: QuestionRequest;
  qIndex: number;
  onSave: (question: QuestionRequest) => void;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  errors?: Record<string, string>;
  isExam?: boolean;
}

const MATERIAL_TYPE_KEYS = Object.keys(MATERIAL_TYPE).filter((v) =>
  isNaN(Number(v)),
);

export const AnswerModal: React.FC<AnswerModalProps> = ({
  questionType,
  questionData,
  qIndex,
  onSave,
  onGetFile,
  errors,
  isExam,
}) => {
  const [question, setQuestion] = useState<QuestionRequest>(questionData);

  useEffect(() => {
    if (questionData) setQuestion(questionData);
  }, [questionData]);

  const handleSaveCurrent = useCallback(() => {
    setQuestion((prev) => {
      onSave(prev);
      return prev;
    });
  }, [onSave]);

  const update = (patch: Partial<QuestionRequest>) => {
    setQuestion((prev) => ({ ...prev, ...patch }));
  };

  // Debounce onSave to prevent main thread blocking on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(question) !== JSON.stringify(questionData)) {
        onSave(question);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [question, onSave, questionData]);

  const handleAddAnswer = () => {
    update({
      answerList: [...question.answerList, createAnswer(0, MATERIAL_TYPE.TEXT)],
    });
  };

  const handleRemoveAnswer = (index: number) => {
    if (question.answerList.length <= 1) return;
    const next = question.answerList.filter((_, i) => i !== index);
    update({ answerList: next });
  };

  const patchAnswer = (index: number, patch: Partial<AnswerRequest>) => {
    setQuestion((prev) => {
      const nextAnswerList = prev.answerList.map((a, i) =>
        i === index ? { ...a, ...patch } : a,
      );
      return { ...prev, answerList: nextAnswerList };
    });
  };

  const handleAnswerSourceChange = (index: number, source: string) => {
    setQuestion((prev) => {
      const answer = prev.answerList[index];
      const newContent = answer.content.map((item: sourceRequest, i: number) =>
        i === 0 ? { ...item, source: source } : item,
      );
      const nextAnswerList = prev.answerList.map((a, i) =>
        i === index ? { ...a, content: newContent } : a,
      );
      return { ...prev, answerList: nextAnswerList };
    });
  };

  const handleAnswerSubContentChange = (index: number, subContent: string) => {
    setQuestion((prev) => {
      const answer = prev.answerList[index];
      const newContent = answer.content.map((item: sourceRequest, i: number) =>
        i === 0 ? { ...item, subContent: subContent } : item,
      );
      const nextAnswerList = prev.answerList.map((a, i) =>
        i === index ? { ...a, content: newContent } : a,
      );
      return { ...prev, answerList: nextAnswerList };
    });
  };

  const handleAnswerMaterialTypeChange = (index: number, newType: number) => {
    patchAnswer(index, { content: [createDynamicSource(newType)] });
  };

  const handleToggleCorrect = (index: number) => {
    const answer = question.answerList[index];
    patchAnswer(index, { isCorrect: answer.isCorrect === 1 ? 0 : 1 });
  };

  const [selectedContentIndex, setSelectedContentIndex] = useState<
    number | null
  >(null);
  const [openDelete, setOpenDelete] = useState(false);
  const onConfirmDelete = () => {
    if (selectedContentIndex !== null) {
      handleRemoveAnswer(selectedContentIndex);
    }
    setOpenDelete(false);
  };

  const handleChangeInputType = (type: number) => {
    const isExisting = question.inputType.includes(type);

    const newInputType = isExisting
      ? question.inputType.filter((item) => item !== type)
      : [...question.inputType, type];

    update({ inputType: newInputType });
  };

  return (
    <Grid size={12} sx={{ mb: 2, mt: 2 }}>
      {(questionData.type === QUESTION_TYPE.MCQ ||
        questionData.type === QUESTION_TYPE.FILL) && (
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
            <Typography variant="subtitle1">
              <FormattedMessage id="answer" />:
            </Typography>
          </Stack>

          <Stack sx={{ mt: 1 }} gap={1}>
            {question.type === QUESTION_TYPE.MCQ
              ? question.answerList.map((answer, index) => {
                  const firstContent =
                    answer.content[0] ??
                    createDynamicSource(MATERIAL_TYPE.TEXT);
                  const isTextOrVideo =
                    firstContent.type === MATERIAL_TYPE.TEXT ||
                    firstContent.type === MATERIAL_TYPE.VIDEO;

                  return (
                    <Stack key={answer.id}>
                      <TextField
                        select
                        size="small"
                        sx={{ width: "40%", backgroundColor: "white" }}
                        value={firstContent.type ?? MATERIAL_TYPE.TEXT}
                        onChange={(e) =>
                          handleAnswerMaterialTypeChange(
                            index,
                            Number(e.target.value),
                          )
                        }
                        onBlur={handleSaveCurrent}
                      >
                        {MATERIAL_TYPE_KEYS.map((key) => (
                          <MenuItem
                            key={key}
                            value={
                              MATERIAL_TYPE[key as keyof typeof MATERIAL_TYPE]
                            }
                          >
                            <FormattedMessage id={key.toLowerCase()} />
                          </MenuItem>
                        ))}
                      </TextField>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mt: 1 }}
                      >
                        <Checkbox
                          checked={answer.isCorrect === 1}
                          onChange={() => handleToggleCorrect(index)}
                          size="small"
                          sx={{ minWidth: 40 }}
                        />

                        <Box sx={{ width: "100%" }}>
                          {firstContent.type === MATERIAL_TYPE.TEXT ? (
                            <RichTextEditor
                              id={`content-${firstContent.id}`}
                              value={firstContent.source}
                              placeholder="Nhập đáp án"
                              hasError={Boolean(
                                errors?.[
                                  `questionList[${qIndex}].answerList[${index}].source`
                                ],
                              )}
                              onChange={(deltaString) =>
                                handleAnswerSourceChange(index, deltaString)
                              }
                            />
                          ) : (
                            <TextField
                              multiline
                              id={`content-${firstContent.id}`}
                              value={firstContent.source}
                              placeholder="Nhập đáp án"
                              error={Boolean(
                                errors?.[
                                  `questionList[${qIndex}].answerList[${index}].source`
                                ],
                              )}
                              onChange={(e) =>
                                handleAnswerSourceChange(index, e.target.value)
                              }
                              onBlur={handleSaveCurrent}
                              sx={{
                                width: "100%",
                                "& .MuiInputBase-root": {
                                  px: 2,
                                  py: 1.5,
                                  ...(isTextOrVideo
                                    ? { height: 120, alignItems: "flex-start" }
                                    : {}),
                                },
                              }}
                            />
                          )}

                          <Box sx={{ border: "top slate 50" }}>
                            <TextField
                              type="text"
                              multiline
                              placeholder="Thêm mô tả cho đáp án này..."
                              value={firstContent.subContent}
                              onChange={(e) =>
                                handleAnswerSubContentChange(
                                  index,
                                  e.target.value,
                                )
                              }
                              sx={{
                                width: "100%",
                                backgroundColor: "transparent",
                                border: "none",
                                padding: 0,
                                fontSize: "11px",
                                fontStyle: "italic",
                                color: "slate.400",
                                "& .MuiInputBase-root": {
                                  padding: "4px 16px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "&.Mui-focused": {
                                  boxShadow: "none",
                                },
                                "&:focus": {
                                  outline: "none",
                                },
                                "& .MuiInput-underline:before, & .MuiInput-underline:after":
                                  {
                                    display: "none",
                                  },
                              }}
                            />
                          </Box>
                        </Box>

                        {!isTextOrVideo && (
                          <IconButton size="medium" component="label">
                            <ExportCurve />

                            <input
                              type="file"
                              hidden
                              onChange={async (e) => {
                                const url = await onGetFile(e);
                                if (url) handleAnswerSourceChange(index, url);
                              }}
                            />
                          </IconButton>
                        )}

                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedContentIndex(index);
                            setOpenDelete(true);
                          }}
                          disabled={question.answerList.length === 1}
                        >
                          <Trash />
                        </IconButton>
                      </Stack>
                    </Stack>
                  );
                })
              : question.type === QUESTION_TYPE.FILL &&
                (() => {
                  const answer = question.answerList[0];
                  if (!answer) return null;

                  const firstContent =
                    answer.content[0] ??
                    createDynamicSource(MATERIAL_TYPE.TEXT);
                  const isTextOrVideo =
                    firstContent.type === MATERIAL_TYPE.TEXT ||
                    firstContent.type === MATERIAL_TYPE.VIDEO;

                  return (
                    <Stack key={answer.id}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mt: 0 }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <TextField
                            multiline
                            id={`content-${firstContent.id}`}
                            value={firstContent.source}
                            placeholder="Nhập đáp án"
                            error={Boolean(
                              errors?.[
                                `questionList[${qIndex}].answerList[0].source`
                              ],
                            )}
                            onChange={(e) =>
                              handleAnswerSourceChange(0, e.target.value)
                            }
                            onBlur={handleSaveCurrent}
                            sx={{
                              width: "100%",
                              "& .MuiInputBase-root": {
                                px: 2,
                                py: 1.5,
                                height: 120,
                                alignItems: "flex-start",
                              },
                            }}
                          />
                        </Box>

                        {!isTextOrVideo && (
                          <IconButton size="medium" component="label">
                            <ExportCurve />

                            <input
                              type="file"
                              hidden
                              onChange={async (e) => {
                                const url = await onGetFile(e);
                                if (url) handleAnswerSourceChange(0, url);
                              }}
                            />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                  );
                })()}

            {question.type === QUESTION_TYPE.MCQ && (
              <Button
                startIcon={<Add />}
                size="small"
                onClick={handleAddAnswer}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  color: "orangered",
                }}
              >
                <Typography>
                  <FormattedMessage id="add-answer" />
                </Typography>
              </Button>
            )}
          </Stack>
        </Grid>
      )}

      {(isExam || questionType === QUESTION_TYPE.ESSAY) &&
        question.type === QUESTION_TYPE.ESSAY && (
          <>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              Hiển thị ô nhập dàn ý cho học viên
              <Switch
                checked={question.isNote}
                onChange={(e) => update({ isNote: !question.isNote })}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography>Loại đáp án cho phép(Tối đa 4)</Typography>

              <Stack direction="row" gap={2} sx={{ mt: 2 }}>
                {MATERIAL_TYPE_KEYS.map((key) => {
                  const enumValue = MATERIAL_TYPE[
                    key as keyof typeof MATERIAL_TYPE
                  ] as number;
                  const isActive = question.inputType.includes(enumValue);

                  return (
                    <Stack
                      key={key}
                      direction="row"
                      justifyContent="center"
                      onClick={() => handleChangeInputType(enumValue)}
                      sx={{
                        p: 2,
                        width: "25%",
                        border: "1px solid",
                        borderColor: isActive ? "primary.main" : "#ddd",
                        borderRadius: 1,
                        fontWeight: "bold",
                        cursor: "pointer",
                        backgroundColor: isActive ? "primary.main" : "white",
                        color: isActive ? "primary.contrastText" : "inherit",
                        "&:hover": {
                          backgroundColor: isActive
                            ? "primary.main"
                            : "#f5f5f5",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <FormattedMessage id={key.toLowerCase()} />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          </>
        )}

      {question.type !== QUESTION_TYPE.SOURCE_ONLY && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <InputLabel sx={{ mb: 1 }}>Giải thích:</InputLabel>
          <RichTextEditor
            id={`explanation-${question.id}`}
            value={question.explanation ?? ""}
            placeholder="Nhập dữ liệu"
            onChange={(deltaString) => update({ explanation: deltaString })}
          />
        </Grid>
      )}

      <ConfirmDialog
        open={openDelete}
        title={"Xác nhận xóa"}
        description={`Bạn có chắc chắn muốn xóa nội dung câu hỏi này không?`}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirmDelete}
      />
    </Grid>
  );
};
