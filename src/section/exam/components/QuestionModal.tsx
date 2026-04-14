import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  MATERIAL_TYPE,
  QUESTION_TYPE,
  QuestionRequest,
  sourceRequest,
} from "@/types/question";
import {
  createAnswer,
  createDynamicSource,
  createQuestion,
} from "@/utils/QuestionFactory";
import { QuestionContentList } from "../editor/QuestionContentBlockList";
import {
  Text,
  VolumeHigh,
  VideoPlay,
  Image as ImageIcon,
  TickCircle,
  Edit2,
  DocumentText,
  InfoCircle,
  Add,
} from "iconsax-reactjs";
import { Divider, IconButton, Typography } from "@mui/material";

interface QuestionModalProps {
  questionType: number;
  questionData: QuestionRequest;
  qIndex: number;
  onSave: (question: QuestionRequest) => void;
  errors?: Record<string, string>;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  isExam?: boolean;
}

const QUESTION_TYPE_KEYS = Object.keys(QUESTION_TYPE).filter((v) =>
  isNaN(Number(v)),
);

export const QUESTION_TYPE_CONFIG: Record<
  number,
  { icon: (size: number) => React.ReactNode; label: string }
> = {
  [QUESTION_TYPE.MCQ]: {
    icon: (size) => <TickCircle size={size} />,
    label: "Câu hỏi Trắc nghiệm",
  },
  [QUESTION_TYPE.FILL]: {
    icon: (size) => <Edit2 size={size} />,
    label: "Câu hỏi Điền từ",
  },
  [QUESTION_TYPE.ESSAY]: {
    icon: (size) => <DocumentText size={size} />,
    label: "Câu hỏi Tự luận",
  },
  [QUESTION_TYPE.SOURCE_ONLY]: {
    icon: (size) => <InfoCircle size={size} />,
    label: "Chỉ nội dung",
  },
};

export const QuestionModal: React.FC<QuestionModalProps> = ({
  onGetFile,
  questionType,
  questionData,
  qIndex,
  onSave,
  errors,
  isExam,
}) => {
  const [question, setQuestion] = useState<QuestionRequest>(
    questionData ?? createQuestion(0, 0),
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    if (questionData) setQuestion(questionData);
    if (questionData) setNote(questionData.note || "");
  }, [questionData]);

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

  const handleAddContentBlock = (type: number) => {
    update({ content: [...question.content, createDynamicSource(type)] });
  };

  const handleContentChange = useCallback(
    (sourceId: string, deltaString: string) => {
      setQuestion((prev) => {
        const next = {
          ...prev,
          content: prev.content.map((item: sourceRequest) =>
            item.id === sourceId ? { ...item, source: deltaString } : item,
          ),
        };
        onSave(next);
        return next;
      });
    },
    [onSave],
  );

  const handleContentRemove = useCallback(
    (sourceId: string) => {
      setQuestion((prev) => {
        const next = {
          ...prev,
          content: prev.content.filter(
            (item: sourceRequest) => item.id !== sourceId,
          ),
        };
        onSave(next);
        return next;
      });
    },
    [onSave],
  );

  const handleSaveCurrent = useCallback(() => {
    setQuestion((prev) => {
      onSave(prev);
      return prev;
    });
  }, [onSave]);

  const isSourceOnly = question.type === QUESTION_TYPE.SOURCE_ONLY;

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {!isSourceOnly && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  STT
                </Typography>
                <TextField
                  size="small"
                  value={question.serialNumber}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      update({ serialNumber: parseInt(e.target.value) || 0 });
                    }
                  }}
                  sx={{
                    width: 60,
                    "& .MuiOutlinedInput-input": {
                      p: "4px 8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Stack>
            )}

            <Divider orientation="vertical" flexItem />

            <Stack
              direction="row"
              spacing={1}
              flexGrow={1}
              sx={{ overflowX: "auto", py: 0.5 }}
            >
              {QUESTION_TYPE_KEYS.filter((key) => {
                const value = QUESTION_TYPE[
                  key as keyof typeof QUESTION_TYPE
                ] as number;
                if (isExam) return true;
                if (questionType === QUESTION_TYPE.ESSAY)
                  return (
                    value === QUESTION_TYPE.ESSAY ||
                    value === QUESTION_TYPE.SOURCE_ONLY
                  );
                if (
                  questionType === QUESTION_TYPE.MCQ ||
                  questionType === QUESTION_TYPE.FILL
                )
                  return (
                    value === QUESTION_TYPE.MCQ ||
                    value === QUESTION_TYPE.FILL ||
                    value === QUESTION_TYPE.SOURCE_ONLY
                  );
                return value === question.type;
              }).map((key) => {
                const value = QUESTION_TYPE[
                  key as keyof typeof QUESTION_TYPE
                ] as number;
                const isActive = question.type === value;
                const config = QUESTION_TYPE_CONFIG[value];
                return (
                  <Tooltip key={key} title={config.label} placement="top">
                    <Button
                      variant={isActive ? "contained" : "outlined"}
                      size="small"
                      onClick={() => {
                        if (value === QUESTION_TYPE.FILL) {
                          update({
                            type: value,
                            answerList: [createAnswer(1, MATERIAL_TYPE.TEXT)],
                          });
                        } else if (value === QUESTION_TYPE.MCQ) {
                          update({
                            type: value,
                            answerList: [
                              createAnswer(1, MATERIAL_TYPE.TEXT),
                              createAnswer(0, MATERIAL_TYPE.TEXT),
                              createAnswer(0, MATERIAL_TYPE.TEXT),
                              createAnswer(0, MATERIAL_TYPE.TEXT),
                            ],
                          });
                        } else {
                          update({
                            type: value,
                            answerList:
                              value === QUESTION_TYPE.ESSAY ||
                              value === QUESTION_TYPE.SOURCE_ONLY
                                ? []
                                : [createAnswer(1, MATERIAL_TYPE.TEXT)],
                          });
                        }
                      }}
                      sx={{
                        minWidth: 40,
                        height: 32,
                        p: 0,
                        borderRadius: 1.5,
                        borderColor: isActive ? "primary.main" : "divider",
                        bgcolor: isActive ? "primary.main" : "white",
                        color: isActive ? "white" : "text.secondary",
                        "&:hover": {
                          bgcolor: isActive ? "primary.dark" : "grey.100",
                        },
                      }}
                    >
                      {config.icon(20)}
                    </Button>
                  </Tooltip>
                );
              })}
            </Stack>

            {!isSourceOnly && (
              <>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    ĐIỂM
                  </Typography>
                  <TextField
                    size="small"
                    value={question.score}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        update({ score: parseInt(e.target.value) || 0 });
                      }
                    }}
                    sx={{
                      width: 60,
                      "& .MuiOutlinedInput-input": {
                        p: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </Stack>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Stack
          sx={{
            width: "100%",
            mt: 1,
            p: 1.5,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.secondary"
            >
              Nội dung câu hỏi
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                {
                  type: MATERIAL_TYPE.TEXT,
                  icon: <Text size={40} />,
                  label: "Thêm Văn bản",
                },
                {
                  type: MATERIAL_TYPE.IMAGE,
                  icon: <ImageIcon size={40} />,
                  label: "Thêm Hình ảnh",
                },
                {
                  type: MATERIAL_TYPE.AUDIO,
                  icon: <VolumeHigh size={40} />,
                  label: "Thêm Âm thanh",
                },
                {
                  type: MATERIAL_TYPE.VIDEO,
                  icon: <VideoPlay size={40} />,
                  label: "Thêm Video",
                },
              ].map(({ type, icon, label }) => (
                <Tooltip title={label} placement="top">
                  <Button
                    key={type}
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddContentBlock(type)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "0.5rem",
                      borderColor: "divider",
                      color: "text.secondary",
                    }}
                  >
                    {icon}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </Stack>

          <QuestionContentList
            content={question.content}
            qIndex={qIndex}
            errors={errors}
            onContentChange={handleContentChange}
            onContentRemove={handleContentRemove}
            onSave={handleSaveCurrent}
            onGetFile={onGetFile}
          />

          {!isSourceOnly && (
            <Box sx={{ mt: question.content.length > 0 ? 1 : 0 }}>
              <>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Yêu cầu câu hỏi
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Lưu ý câu hỏi"
                  multiline
                  name="note"
                  size="small"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={(e) => update({ note: e.target.value })}
                  sx={{ backgroundColor: "white" }}
                />
              </>
            </Box>
          )}
        </Stack>
      </Grid>
    </>
  );
};
