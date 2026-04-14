import React, { memo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { CloseCircle, TickCircle } from "iconsax-reactjs";
import {
  MATERIAL_TYPE,
  QUESTION_TYPE,
  QuestionGroupListRequest,
  QuestionRequest,
  sourceRequest,
} from "@/types/question";
import { MediaRenderer } from "./MediaRenderer";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { RichTextEditor } from "@/components/RickTextEditor";

interface PreviewModalProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  questionGroupList: QuestionGroupListRequest;
}

interface TiptapReadOnlyProps {
  value: string;
  sx?: object;
}

const hasSource = (item: sourceRequest) => Boolean(item.source?.trim());
const TIPTAP_EXTENSIONS = [StarterKit, Underline, TextStyle, Color];

export const TiptapReadOnly: React.FC<TiptapReadOnlyProps> = ({
  value,
  sx,
}) => {
  const editor = useEditor({
    editable: false,
    extensions: TIPTAP_EXTENSIONS,
    content: "",
  });

  useEffect(() => {
    if (editor && value) {
      try {
        const parsedValue = JSON.parse(value);
        editor.commands.setContent(parsedValue);
      } catch {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <Box
      sx={{
        "& .ProseMirror": {
          outline: "none",
          lineHeight: 1.6,
          fontSize: "inherit",
          color: "inherit",
          wordBreak: "break-word",
          "& p": { margin: 0 },
          "& ul, & ol": { paddingLeft: "1.2rem", margin: "0.5rem 0" },
          ...sx,
        },
      }}
    >
      <EditorContent
        editor={editor}
        style={{ display: "block", minHeight: "1px" }}
      />
    </Box>
  );
};

const PreviewSourceItem: React.FC<{ item: sourceRequest; textSx?: object }> = ({
  item,
  textSx,
}) => {
  if (!hasSource(item)) return null;

  if (item.type === MATERIAL_TYPE.TEXT) {
    return <TiptapReadOnly value={item.source} sx={textSx} />;
  }

  if (item.type === MATERIAL_TYPE.AUDIO) {
    return (
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
        }}
      >
        <audio
          src={item.source}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "100%", height: 32 }}
        />
      </Box>
    );
  }

  return <MediaRenderer item={item} />;
};

const PreviewHeader = memo<{ items: sourceRequest[] }>(({ items }) => {
  const visible = items.filter(hasSource);
  if (visible.length === 0) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "grey.100",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {visible.map((item) => (
        <PreviewSourceItem
          key={item.id}
          item={item}
          textSx={{ fontSize: "1rem", lineHeight: 1.25 }}
        />
      ))}
    </Box>
  );
});

PreviewHeader.displayName = "PreviewHeader";

const PreviewContent = memo<{ items: sourceRequest[] }>(({ items }) => {
  const visible = items.filter(hasSource);
  if (visible.length === 0) return null;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04)",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "grey.400",
            borderRadius: 4,
            "&:hover": { bgcolor: "grey.500" },
          },
        }}
      >
        {visible.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[50], 0.8),
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.100",
              overflow: "visible",
            }}
          >
            <PreviewSourceItem item={item} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
});

PreviewContent.displayName = "PreviewContent";

const PreviewAnswerList: React.FC<{ question: QuestionRequest }> = ({
  question,
}) => {
  const validAnswers = question.answerList.filter(
    (opt) => opt.content.length > 0 && hasSource(opt.content[0]),
  );

  return (
    <Stack spacing={1.5}>
      {validAnswers.map((opt) => {
        const firstContent = opt.content[0];
        const isCorrect = opt.isCorrect === 1;

        return (
          <Box
            key={opt.id}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: isCorrect ? "success.main" : "grey.200",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              transition: "all 0.2s",
              bgcolor: isCorrect
                ? (theme) => alpha(theme.palette.success.main, 0.05)
                : (theme) => alpha(theme.palette.grey[50], 0.5),
              boxShadow: isCorrect
                ? (theme) =>
                    `0 2px 8px ${alpha(theme.palette.success.main, 0.1)}`
                : "none",
              "&:hover": !isCorrect
                ? {
                    borderColor: "primary.light",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  }
                : {},
            }}
          >
            {isCorrect ? (
              <Box
                sx={{
                  bgcolor: "success.main",
                  p: 0.5,
                  borderRadius: "50%",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <TickCircle size={14} variant="Bold" color="white" />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "grey.300",
                  flexShrink: 0,
                }}
              />
            )}

            <Box sx={{ flex: 1 }}>
              <PreviewSourceItem
                item={firstContent}
                textSx={{
                  fontSize: "0.875rem",
                  color: isCorrect ? "success.dark" : "text.secondary",
                }}
              />

              {firstContent.subContent && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.disabled",
                    mt: 0.5,
                    fontStyle: "italic",
                    display: "block",
                  }}
                >
                  {firstContent.subContent}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const UPLOAD_BUTTONS = [
  { type: MATERIAL_TYPE.AUDIO, label: "Tải lên Audio" },
  { type: MATERIAL_TYPE.IMAGE, label: "Tải lên Hình ảnh" },
  { type: MATERIAL_TYPE.VIDEO, label: "Tải lên Video" },
] as const;

const PreviewAnswerInput: React.FC<{ question: QuestionRequest }> = ({
  question,
}) => {
  if (question.type === QUESTION_TYPE.FILL) {
    return (
      <Box>
        <InputBase
          fullWidth
          placeholder="Nhập câu trả lời của bạn..."
          sx={{
            height: 44,
            px: 3,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
            fontSize: "0.875rem",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: (theme) =>
                `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
            },
          }}
        />
      </Box>
    );
  }

  const isEssay = question.type === QUESTION_TYPE.ESSAY;
  const uploadButtons = UPLOAD_BUTTONS.filter(({ type }) =>
    question.inputType?.includes(type),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {question.isNote && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="caption"
            fontWeight={900}
            color="text.disabled"
            sx={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            Ghi chú / Dàn ý
          </Typography>

          <InputBase
            fullWidth
            multiline
            placeholder="Nhập ghi chú hoặc dàn ý cho bài viết..."
            sx={{
              minHeight: 48,
              px: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              fontSize: "0.875rem",
              "&:focus-within": {
                borderColor: "primary.main",
                boxShadow: (theme) =>
                  `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
              },
            }}
          />
        </Box>
      )}

      {(isEssay || question.inputType?.includes(MATERIAL_TYPE.TEXT)) && (
        <Box sx={{ mt: 1 }}>
          <RichTextEditor
            id="preview-input"
            placeholder="Nhập nội dung câu trả lời của bạn..."
          />
        </Box>
      )}

      {uploadButtons.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {uploadButtons.map(({ type, label }) => (
            <Button
              key={type}
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 120,
                py: 1.5,
                borderRadius: 2,
                borderStyle: "dashed",
                borderColor: "grey.300",
                color: "text.disabled",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

const PreviewQuestionItem = memo<{ question: QuestionRequest }>(
  ({ question: q }) => {
    const hasContent =
      q.content.length > 0 && q.content.some((item) => hasSource(item));

    if (q.type === QUESTION_TYPE.SOURCE_ONLY) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {hasContent && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {q.content.map((item) => (
                <PreviewSourceItem
                  key={item.id}
                  item={item}
                  textSx={{ fontSize: "0.875rem", color: "text.primary" }}
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "start",
          gap: 2,
        }}
      >
        {q.serialNumber !== 0 && (
          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "white",
              fontSize: "0.625rem",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: (theme) =>
                `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
              minWidth: 26,
              textAlign: "center",
            }}
          >
            {q.serialNumber}
          </Box>
        )}

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {hasContent && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1 }}
            >
              {q.content.map((item) => (
                <PreviewSourceItem
                  key={item.id}
                  item={item}
                  textSx={{ fontSize: "0.875rem", color: "text.primary" }}
                />
              ))}
            </Box>
          )}

          {q?.note?.trim() && (
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.disabled",
                fontStyle: "italic",
                mb: 1,
              }}
            >
              Yêu cầu: {q.note}
            </Typography>
          )}

          {q.type === QUESTION_TYPE.MCQ ? (
            <PreviewAnswerList question={q} />
          ) : q.type === QUESTION_TYPE.ESSAY ||
            q.type === QUESTION_TYPE.FILL ? (
            <PreviewAnswerInput question={q} />
          ) : null}
        </Box>
      </Box>
    );
  },
);

PreviewQuestionItem.displayName = "PreviewQuestionItem";

const PreviewQuestionList = memo<{ questions: QuestionRequest[] }>(
  ({ questions }) => {
    if (questions.length === 0) return null;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.100",
            height: "100%",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04)",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.400",
              borderRadius: 4,
              "&:hover": { bgcolor: "grey.500" },
            },
          }}
        >
          <Stack
            spacing={5}
            divider={<Box sx={{ height: "1px", bgcolor: "grey.100" }} />}
          >
            {questions.map((q) => (
              <PreviewQuestionItem key={q.id} question={q} />
            ))}
          </Stack>
        </Paper>
      </Box>
    );
  },
);

PreviewQuestionList.displayName = "PreviewQuestionList";

export const PreviewModal: React.FC<PreviewModalProps> = ({
  showPreview,
  setShowPreview,
  questionGroupList,
}) => {
  return (
    <Dialog
      open={showPreview}
      onClose={() => setShowPreview(false)}
      keepMounted
    >
      <DialogContent>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(4px)",
            }}
          />

          <Paper
            component={motion.div}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            elevation={0}
            sx={{
              position: "relative",
              bgcolor: "background.default",
              borderRadius: 2,
              width: "100%",
              maxWidth: 1152,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            }}
          >
            <Box
              sx={{
                px: 4,
                py: 2.5,
                bgcolor: "white",
                borderBottom: "1px solid",
                borderColor: "grey.100",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: "primary.main",
                    borderRadius: "50%",
                    animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                    "@keyframes pulse": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                    },
                  }}
                />

                <Typography
                  variant="caption"
                  fontWeight={900}
                  color="text.disabled"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
                >
                  Chế độ xem trước
                </Typography>
              </Box>

              <IconButton
                onClick={() => setShowPreview(false)}
                size="small"
                sx={{
                  "&:hover": { color: "text.secondary", bgcolor: "grey.50" },
                }}
              >
                <CloseCircle size={32} />
              </IconButton>
            </Box>

            <Box
              sx={{
                p: 4,
                overflowY: "auto",
                flex: 1,
                height: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <PreviewHeader items={questionGroupList.title} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {questionGroupList.questionGroup.map((group, idx) => {
                  const groupHasContent = group.content.some(hasSource);
                  const groupHasQuestions = group.questionList.length > 0;

                  return groupHasContent || groupHasQuestions ? (
                    <Box
                      key={group.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          groupHasContent && groupHasQuestions
                            ? { xs: "1fr", lg: "1fr 1fr" }
                            : "1fr",
                        gap: 2,
                        alignItems: "stretch",
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      {groupHasContent && (
                        <PreviewContent items={group.content} />
                      )}
                      {groupHasQuestions && (
                        <PreviewQuestionList questions={group.questionList} />
                      )}
                    </Box>
                  ) : null;
                })}
              </Box>
            </Box>

            <Box
              sx={{
                px: 4,
                py: 3,
                bgcolor: "white",
                borderTop: "1px solid",
                borderColor: "grey.100",
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                onClick={() => setShowPreview(false)}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  color: "text.secondary",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                Đóng
              </Button>

              <Button
                variant="contained"
                onClick={() => setShowPreview(false)}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  boxShadow: (theme) =>
                    `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": {
                    boxShadow: (theme) =>
                      `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                  },
                }}
              >
                Tiếp tục chỉnh sửa
              </Button>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
