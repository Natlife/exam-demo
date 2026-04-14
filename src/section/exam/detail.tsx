import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type ExamSetupRequest,
  type ExamSubmitRequest,
} from "@/types/assignment";
import {
  MATERIAL_TYPE,
  QUESTION_TYPE,
  type AnswerRequest,
  type QuestionGroupListRequest,
  type QuestionRequest,
  type sourceRequest,
} from "@/types/question";
import Button from "@mui/material/Button";
import {
  Alert,
  alpha,
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Radio,
  Snackbar,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import {
  CloseCircle,
  TickCircle,
  VolumeHigh,
  ArrowLeft2,
  ArrowRight2,
  Clock,
  Book,
  Timer1,
} from "iconsax-reactjs";
import { RichTextEditor } from "@/components/RickTextEditor";
import { getById, save, submit } from "@/api/exam";
import { create } from "@/api/file";
import OverlayLoader from "@/components/OverlayLoader";
import { fontSize } from "@mui/system";
import { MediaRenderer } from "./components/MediaRenderer";
import { TiptapReadOnly } from "./components/PreviewModal";

// --- Shared Helper Components adapted from assignment ---

const createId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const hasSource = (item?: sourceRequest | null) =>
  Boolean(item?.source?.trim());
const hasVisibleItems = (items?: sourceRequest[]) =>
  (items ?? []).some(hasSource);

const isAnswerFilled = (question: QuestionRequest) => {
  if (question.type === QUESTION_TYPE.SOURCE_ONLY) return true;
  const selected = question.selectedAnswer ?? [];
  if (question.type === QUESTION_TYPE.MCQ) return selected.length > 0;
  return selected.some((answer) => (answer.content ?? []).some(hasSource));
};

const normalizeAnswers = (answers?: AnswerRequest[]) => answers ?? [];
const getSelectedContent = (question: QuestionRequest) =>
  question.selectedAnswer?.[0]?.content ?? [];

const getQuestionInputTypes = (question: QuestionRequest) => {
  if (question.type === QUESTION_TYPE.FILL) return [MATERIAL_TYPE.TEXT];
  return (question.inputType as any)?.length
    ? (question.inputType as any)
    : [MATERIAL_TYPE.TEXT];
};

const buildStructuredContent = (question: QuestionRequest) => {
  const existingItems = getSelectedContent(question);
  const result = [...existingItems];
  const inputTypes = getQuestionInputTypes(question);

  if (
    inputTypes.includes(MATERIAL_TYPE.TEXT) &&
    !result.some((i) => i.type === MATERIAL_TYPE.TEXT)
  ) {
    result.push({
      id: createId(),
      type: MATERIAL_TYPE.TEXT,
      source: "",
      subContent: "",
    });
  }
  return result;
};

const getTextSlot = (items: sourceRequest[]) =>
  items.find((item) => item.type === MATERIAL_TYPE.TEXT);

const buildQuestionAnswers = (
  question: QuestionRequest,
  updater: (items: sourceRequest[]) => sourceRequest[],
) => {
  const nextItems = updater(buildStructuredContent(question));
  const hasDraft = nextItems.some(
    (item) => item.source.trim() || item.subContent?.trim(),
  );
  if (!hasDraft) return [];
  const existing = question.selectedAnswer?.[0];
  return [{ id: existing?.id ?? createId(), content: nextItems }];
};

const updateTextSlot = (
  items: sourceRequest[],
  patch: { source?: string; subContent?: string },
) =>
  items.map((item) =>
    item.type === MATERIAL_TYPE.TEXT
      ? {
          ...item,
          source: patch.source ?? item.source ?? "",
          subContent: patch.subContent ?? item.subContent ?? "",
        }
      : item,
  );

const addMediaSlots = (
  items: sourceRequest[],
  type: MATERIAL_TYPE,
  sources: string[],
) => {
  const newItems = sources.map((source) => ({
    id: createId(),
    type,
    source,
    subContent: "",
  }));
  return [...items, ...newItems];
};

const removeMediaSlot = (items: sourceRequest[], id: string) =>
  items.filter((item) => item.id !== id);

const getAcceptType = (inputType: MATERIAL_TYPE) => {
  switch (inputType) {
    case MATERIAL_TYPE.IMAGE:
      return "image/*";
    case MATERIAL_TYPE.AUDIO:
      return "audio/*";
    case MATERIAL_TYPE.VIDEO:
      return "video/*";
    default:
      return "";
  }
};

export const UploadPreview = ({
  item,
  audioRef,
  onPlay,
  onEnd,
  onRemove,
  disabled,
}: {
  item: sourceRequest;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}) => (
  <Box
    sx={{
      position: "relative",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "grey.200",
      bgcolor: "white",
      p: 2,
    }}
  >
    {item.type === MATERIAL_TYPE.AUDIO ? (
      <Box
        sx={{
          bgcolor: "grey.50",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              p: 1,
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <VolumeHigh size={18} color="#2563eb" />
          </Box>

          <audio
            controls
            controlsList="nodownload"
            preload="none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ width: "100%" }}
            ref={audioRef === null ? undefined : audioRef}
            onPlay={(e) => onPlay(e.currentTarget)}
            onPause={onEnd}
            onEnded={onEnd}
          >
            <source src={item.source} />
            Trình duyệt của bạn không hỗ trợ phần tử audio.
          </audio>
        </Box>
      </Box>
    ) : (
      <MediaRenderer
        item={item}
        audioRef={audioRef ?? undefined}
        onAudioPlay={onPlay}
      />
    )}

    {onRemove && (
      <IconButton
        size="small"
        disabled={disabled}
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "rgba(15,23,42,0.7)",
          color: "white",
          "&:hover": { bgcolor: "rgba(15,23,42,0.9)" },
        }}
      >
        <CloseCircle size={18} />
      </IconButton>
    )}
  </Box>
);

export const SourceItemCard = ({
  item,
  ownerId,
  totalPlayed,
  exam,
  audioRef,
  onPlay,
  onEnd,
  handleTotalPlayedChange,
  compact = false,
}: {
  item: sourceRequest;
  ownerId?: string;
  totalPlayed?: number;
  exam?: ExamSetupRequest;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  handleTotalPlayedChange?: (id: string) => void;
  compact?: boolean;
}) => {
  if (!hasSource(item)) return null;
  if (item.type === MATERIAL_TYPE.TEXT)
    return <TiptapReadOnly value={item.source} sx={{ fontSize: "0.85rem" }} />;

  if (item.type === MATERIAL_TYPE.AUDIO) {
    const hasReachedLimit = Boolean(
      exam &&
      exam.totalPlay !== 0 &&
      typeof totalPlayed === "number" &&
      totalPlayed >= exam.totalPlay,
    );

    return (
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          p: compact ? 1.5 : 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Audio
            </Typography>

            {exam?.totalPlay ? (
              <Typography
                variant="caption"
                color={hasReachedLimit ? "error.main" : "text.secondary"}
              >
                {hasReachedLimit
                  ? `Đã hết lượt nghe (${totalPlayed ?? 0}/${exam.totalPlay})`
                  : `Lượt nghe: ${totalPlayed ?? 0}/${exam.totalPlay}`}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <audio
          controls
          controlsList="nodownload"
          preload="none"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "100%" }}
          ref={audioRef === null ? undefined : audioRef}
          onPlay={(e) => {
            if (hasReachedLimit) {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
              return;
            }
            if (ownerId && handleTotalPlayedChange)
              handleTotalPlayedChange(ownerId);
            onPlay(e.currentTarget);
          }}
          onPause={onEnd}
          onEnded={onEnd}
        >
          <source src={item.source} />
          Trình duyệt của bạn không hỗ trợ phần tử audio.
        </audio>
      </Box>
    );
  }

  return (
    <MediaRenderer
      item={item}
      audioRef={audioRef ?? undefined}
      onAudioPlay={onPlay}
      maxImageHeight={compact ? 240 : undefined}
    />
  );
};

const QuestionAnswerOptions = ({
  question,
  onAnswerChange,
  audioRef,
  onPlay,
  onEnd,
}: {
  question: QuestionRequest;
  onAnswerChange?: (questionId: string, answers: AnswerRequest[]) => void;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
}) => {
  const selectedAnswer = normalizeAnswers(question.selectedAnswer);
  const reviewMode = !onAnswerChange;
  const validAnswers = (question.answerList ?? []).filter(
    (a) => a.content.length > 0 && hasSource(a.content[0]),
  );

  return (
    <Stack spacing={1.5}>
      {validAnswers.map((answer) => {
        const firstContent = answer.content[0];
        const isSelected = selectedAnswer.some((item) => item.id === answer.id);
        const isCorrect = answer.isCorrect === 1;

        let borderColor = "grey.200";
        let backgroundColor = "white";

        if (reviewMode) {
          if (isCorrect) {
            borderColor = "success.main";
            backgroundColor = alpha("#2e7d32", 0.06);
          } else if (isSelected) {
            borderColor = "error.main";
            backgroundColor = alpha("#d32f2f", 0.06);
          }
        } else if (isSelected) {
          borderColor = "primary.main";
          backgroundColor = alpha("#2563eb", 0.05);
        }

        return (
          <Box
            key={answer.id}
            onClick={() => {
              if (!reviewMode && onAnswerChange) {
                const current = question.selectedAnswer ?? [];
                const alreadySelected = current.some(
                  (item) => item.id === answer.id,
                );
                const nextAnswers = question.isMultipleChoice
                  ? alreadySelected
                    ? current.filter((item) => item.id !== answer.id)
                    : [...current, answer]
                  : [answer];
                onAnswerChange(question.id, nextAnswers);
              }
            }}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor,
              bgcolor: backgroundColor,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              cursor: reviewMode ? "default" : "pointer",
              transition: "all 0.2s ease",
              "&:hover": reviewMode
                ? undefined
                : { borderColor: "primary.main" },
            }}
          >
            {question.isMultipleChoice ? (
              <Checkbox checked={isSelected} sx={{ p: 0, mt: 0.25 }} />
            ) : (
              <Radio checked={isSelected} sx={{ p: 0, mt: 0.25 }} />
            )}

            <Box sx={{ flex: 1 }}>
              <SourceItemCard
                item={firstContent}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
                compact
              />

              {firstContent.subContent && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    mt: 0.75,
                    fontStyle: "italic",
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

const EssayAnswerEditor = ({
  question,
  onAnswerChange,
  handleGetFileUrls,
  audioRef,
  onPlay,
  onEnd,
  isPreview,
}: {
  question: QuestionRequest;
  onAnswerChange?: (questionId: string, answers: AnswerRequest[]) => void;
  handleGetFileUrls?: (
    e: ChangeEvent<HTMLInputElement>,
    expectedType: MATERIAL_TYPE,
  ) => Promise<string[]>;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  isPreview?: boolean;
}) => {
  const selectedContent = buildStructuredContent(question);
  const textSlot = getTextSlot(selectedContent);

  const essayRef = useRef(textSlot?.source ?? "");
  const noteRef = useRef(textSlot?.subContent ?? "");

  const [noteValue, setNoteValue] = useState(textSlot?.subContent ?? "");
  const [essayValue, setEssayValue] = useState(textSlot?.source ?? "");

  useEffect(() => {
    const incoming = textSlot?.source ?? "";
    const incomingNote = textSlot?.subContent ?? "";

    if (incoming !== essayRef.current) {
      essayRef.current = incoming;
      setEssayValue(incoming);
    }

    if (incomingNote !== noteRef.current) {
      noteRef.current = incomingNote;
      setNoteValue(incomingNote);
    }
  }, [textSlot?.source, textSlot?.subContent]);

  const uploadTypes = ((question.inputType as any) ?? []).filter(
    (type: MATERIAL_TYPE) => type !== MATERIAL_TYPE.TEXT,
  );
  const uploadedItems = selectedContent.filter(
    (item: any) => item.type !== MATERIAL_TYPE.TEXT && hasSource(item),
  );

  const commitTextAnswer = useCallback(
    (nextSource: string, nextNote: string) => {
      if (!onAnswerChange) return;
      onAnswerChange(
        question.id,
        buildQuestionAnswers(question, (items) =>
          updateTextSlot(items, {
            source: nextSource,
            subContent: question.isNote ? nextNote : "",
          }),
        ),
      );
    },
    [onAnswerChange, question],
  );

  if (!onAnswerChange) {
    if (isPreview) {
      return (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Bài làm (Chế độ xem trước)
          </Typography>
          <RichTextEditor
            id={`preview-essay-${question.id}`}
            placeholder="Nhập câu trả lời của bạn..."
            disabled
          />
        </Box>
      );
    }
    return (
      <Stack spacing={2}>
        {question.isNote && noteValue.trim() && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Ghi chú / Dàn ý
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
            >
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {noteValue}
              </Typography>
            </Paper>
          </Box>
        )}

        {essayValue.trim() && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Bài làm
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <TiptapReadOnly value={essayValue} />
            </Paper>
          </Box>
        )}

        {uploadedItems.length > 0 && (
          <Grid container spacing={2}>
            {uploadedItems.map((item: any) => (
              <Grid key={item.id} size={{ xs: 12 }}>
                <UploadPreview
                  item={item}
                  audioRef={audioRef}
                  onPlay={onPlay}
                  onEnd={onEnd}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      {question.isNote && (
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Ghi chú / dàn ý"
          value={noteValue}
          onChange={(e) => {
            noteRef.current = e.target.value;
            setNoteValue(e.target.value);
          }}
          onBlur={() => commitTextAnswer(essayRef.current, noteRef.current)}
          sx={{
            "& .MuiOutlinedInput-root": { bgcolor: "grey.50", borderRadius: 2 },
          }}
        />
      )}

      {(question.inputType as any)?.includes(MATERIAL_TYPE.TEXT) && (
        <RichTextEditor
          id={`essay-answer-${question.id}`}
          value={essayValue}
          placeholder="Nhập câu trả lời của bạn..."
          onChange={(value) => {
            essayRef.current = value;
            setEssayValue(value);
            commitTextAnswer(value, noteRef.current);
          }}
          onBlur={() => commitTextAnswer(essayRef.current, noteRef.current)}
        />
      )}

      {uploadTypes.length > 0 && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {uploadTypes.map((type: any) => (
            <Button
              key={type}
              variant="outlined"
              component="label"
              sx={{ borderStyle: "dashed", borderRadius: 2, px: 2.5, py: 1.25 }}
            >
              {type === MATERIAL_TYPE.IMAGE
                ? "Tải ảnh"
                : type === MATERIAL_TYPE.AUDIO
                  ? "Tải audio"
                  : "Tải video"}

              <input
                hidden
                multiple
                accept={getAcceptType(type)}
                onChange={async (event) => {
                  if (!handleGetFileUrls) return;
                  const urls = await handleGetFileUrls(event, type);
                  if (!urls || urls.length === 0) return;
                  onAnswerChange(
                    question.id,
                    buildQuestionAnswers(question, (items) =>
                      addMediaSlots(items, type, urls),
                    ),
                  );
                }}
              />
            </Button>
          ))}
        </Stack>
      )}

      {uploadedItems.length > 0 && (
        <Grid container spacing={2}>
          {uploadedItems.map((item: any) => (
            <Grid key={item.id} size={{ xs: 12 }}>
              <UploadPreview
                item={item}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
                onRemove={() =>
                  onAnswerChange &&
                  onAnswerChange(
                    question.id,
                    buildQuestionAnswers(question, (items) =>
                      removeMediaSlot(items, item.id),
                    ),
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

const FillAnswerEditor = ({
  question,
  onAnswerChange,
  isPreview,
}: {
  question: QuestionRequest;
  onAnswerChange?: (questionId: string, answers: AnswerRequest[]) => void;
  isPreview?: boolean;
}) => {
  const selectedContent = buildStructuredContent(question);
  const textSlot = getTextSlot(selectedContent);
  const [value, setValue] = useState(textSlot?.source ?? "");

  useEffect(() => {
    setValue(textSlot?.source ?? "");
  }, [textSlot?.source]);

  const commitFillAnswer = (nextValue: string) => {
    if (!onAnswerChange) return;
    onAnswerChange(
      question.id,
      buildQuestionAnswers(question, (items) =>
        updateTextSlot(items, { source: nextValue, subContent: "" }),
      ),
    );
  };

  if (!onAnswerChange) {
    const isFilled = value.trim().length > 0;
    if (isPreview && !isFilled) {
      return (
        <TextField
          fullWidth
          disabled
          placeholder="Nhập câu trả lời (Chế độ xem trước)"
          sx={{
            "& .MuiOutlinedInput-root": { bgcolor: "grey.50", borderRadius: 2 },
          }}
        />
      );
    }
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isFilled ? alpha("#2563eb", 0.04) : "grey.50",
            borderColor: isFilled ? "primary.main" : "grey.300",
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: isFilled ? "primary.dark" : "text.secondary",
            }}
          >
            {value || "Chưa có câu trả lời"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <TextField
      fullWidth
      placeholder="Nhập câu trả lời"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => commitFillAnswer(value)}
      sx={{
        "& .MuiOutlinedInput-root": { bgcolor: "grey.50", borderRadius: 2 },
      }}
    />
  );
};

export const QuestionBlock = ({
  question,
  setRef,
  onAnswerChange,
  handleGetFileUrls,
  audioRef,
  onPlay,
  onEnd,
  exam,
  handleTotalPlayedChange,
  gradingAction = true,
  isPreview,
  activeQuestionId,
}: {
  question: QuestionRequest;
  setRef: (el: HTMLElement | null, id: string) => void;
  onAnswerChange?: (questionId: string, answers: AnswerRequest[]) => void;
  handleGetFileUrls?: (
    e: ChangeEvent<HTMLInputElement>,
    expectedType: MATERIAL_TYPE,
  ) => Promise<string[]>;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  exam?: ExamSetupRequest;
  handleTotalPlayedChange?: (id: string) => void;
  gradingAction?: boolean;
  isPreview?: boolean;
  activeQuestionId?: string;
}) => {
  const showNumber =
    question.type !== QUESTION_TYPE.SOURCE_ONLY && question.serialNumber !== 0;
  const hasQuestionContent = hasVisibleItems(question.content);
  const isActive = activeQuestionId === question.id;

  return (
    <Box
      id={question.id}
      ref={(el: HTMLDivElement | null) => setRef(el, question.id)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: isActive ? 2 : 0,
        borderRadius: 2,
        border: isActive ? "2px solid" : "2px solid transparent",
        borderColor: isActive ? "primary.main" : "transparent",
        bgcolor: isActive ? alpha("#2563eb", 0.02) : "transparent",
        transition: "all 0.3s ease-in-out",
        scrollMarginTop: 120,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {showNumber && (
          <Box sx={{ mt: 0.25 }}>
            <Box
              sx={{
                px: 1.25,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {question.serialNumber !== 0 &&
                `Câu hỏi ${question.serialNumber}:`}
            </Box>
          </Box>
        )}

        <Stack sx={{ flexGrow: 1 }} spacing={1.5}>
          {hasQuestionContent && (
            <Stack spacing={1.5}>
              {question.content.map((item) =>
                hasSource(item) ? (
                  <Box key={item.id}>
                    <SourceItemCard
                      item={item}
                      ownerId={question.id}
                      totalPlayed={question.totalPlayed}
                      exam={exam}
                      audioRef={audioRef}
                      onPlay={onPlay}
                      onEnd={onEnd}
                      handleTotalPlayedChange={handleTotalPlayedChange}
                    />
                  </Box>
                ) : null,
              )}
            </Stack>
          )}

          {showNumber && question.note?.trim() && (
            <Typography
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Yêu cầu: {question.note}
            </Typography>
          )}

          {question.type === QUESTION_TYPE.MCQ && (
            <Box>
              <QuestionAnswerOptions
                question={question}
                onAnswerChange={onAnswerChange}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
              />
            </Box>
          )}

          {question.type === QUESTION_TYPE.ESSAY && (
            <Box>
              <EssayAnswerEditor
                question={question}
                onAnswerChange={onAnswerChange}
                handleGetFileUrls={handleGetFileUrls}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
                isPreview={isPreview}
              />
            </Box>
          )}

          {question.type === QUESTION_TYPE.FILL && (
            <Box>
              <FillAnswerEditor
                question={question}
                onAnswerChange={onAnswerChange}
                isPreview={isPreview}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export const TaskBlock = ({
  group,
  setRef,
  onAnswerChange,
  handleGetFileUrls,
  currentAudioRef,
  onPlay,
  exam,
  handleTotalPlayedChange,
  onEnd,
  index,
  globalSubGroupOffset = 0,
  isPreview,
  activeQuestionId,
}: {
  group: QuestionGroupListRequest;
  setRef: (el: HTMLElement | null, id: string) => void;
  onAnswerChange?: (questionId: string, answers: AnswerRequest[]) => void;
  handleGetFileUrls?: (
    e: ChangeEvent<HTMLInputElement>,
    expectedType: MATERIAL_TYPE,
  ) => Promise<string[]>;
  currentAudioRef?: React.Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  exam?: ExamSetupRequest;
  handleTotalPlayedChange?: (id: string) => void;
  onEnd: () => void;
  index: number;
  globalSubGroupOffset?: number;
  isPreview?: boolean;
  activeQuestionId?: string;
}) => {
  const visibleTitle = (group.title ?? []).filter(hasSource);
  const hasSubGroups = (group.questionGroup ?? []).length > 0;

  if (visibleTitle.length === 0 && !hasSubGroups) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.100",
        bgcolor: "white",
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        position: "relative",
        "&:hover": { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)" },
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Stack spacing={2}>
        {/* ROW 1: Common Title Content (Full Width) */}
        {visibleTitle.length > 0 && (
          <Box
            sx={{ pb: 2, borderBottom: "1px solid", borderColor: "grey.50" }}
          >
            <Stack spacing={1.5}>
              {visibleTitle.map((item) => (
                <SourceItemCard
                  key={item.id}
                  item={item}
                  ownerId={group.id}
                  totalPlayed={group.totalPlayed}
                  exam={exam}
                  audioRef={currentAudioRef}
                  onPlay={onPlay}
                  onEnd={onEnd}
                  handleTotalPlayedChange={handleTotalPlayedChange}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* List of Question Groups (Sub-groups) */}
        <Stack spacing={3}>
          {group.questionGroup.map((subGroup, subIdx) => {
            const hasSubContent = hasVisibleItems(subGroup.content);
            return (
              <Box key={subGroup.id}>
                <Grid container spacing={hasSubContent ? 2 : 0}>
                  {/* Sub-group Content (Split Left) */}
                  {hasSubContent && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          maxHeight: "calc(100vh - 200px)",
                          overflowY: "auto",
                          "&::-webkit-scrollbar": { width: 5 },
                          "&::-webkit-scrollbar-thumb": {
                            bgcolor: "grey.300",
                            borderRadius: 4,
                          },
                          "&::-webkit-scrollbar-track": {
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        <Stack spacing={2}>
                          {subGroup.content.map((item) => (
                            <SourceItemCard
                              key={item.id}
                              item={item}
                              ownerId={subGroup.id}
                              totalPlayed={subGroup.totalPlayed}
                              exam={exam}
                              audioRef={currentAudioRef}
                              onPlay={onPlay}
                              onEnd={onEnd}
                              handleTotalPlayedChange={handleTotalPlayedChange}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                  {/* Sub-group Questions (Split Right or Full Width if no content) */}
                  <Grid size={{ xs: 12, sm: hasSubContent ? 6 : 12 }}>
                    <Box
                      sx={{
                        maxHeight: "calc(100vh - 200px)",
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": { width: 5 },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: "grey.300",
                          borderRadius: 4,
                        },
                        "&::-webkit-scrollbar-track": {
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {subGroup.questionList
                          .filter(
                            (q) =>
                              q.serialNumber !== 0 ||
                              q.type === QUESTION_TYPE.SOURCE_ONLY,
                          )
                          .map((q) => (
                            <QuestionBlock
                              key={q.id}
                              question={q}
                              setRef={setRef}
                              onAnswerChange={onAnswerChange}
                              handleGetFileUrls={handleGetFileUrls}
                              audioRef={currentAudioRef}
                              onPlay={onPlay}
                              onEnd={onEnd}
                              exam={exam}
                              handleTotalPlayedChange={handleTotalPlayedChange}
                              isPreview={isPreview}
                              activeQuestionId={activeQuestionId}
                            />
                          ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
                {subIdx < group.questionGroup.length - 1 && (
                  <Divider sx={{ mt: 3, borderStyle: "dashed" }} />
                )}
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};

const formatTime = (totalSeconds: number) => {
  if (totalSeconds < 0 || Number.isNaN(totalSeconds)) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// --- Main Detail Page Implementation ---

export default function DetailExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamSetupRequest | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeValue, setTimeValue] = useState(0);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const timeElapsedRef = useRef(0);
  const lastAutoSaveRef = useRef(0);
  const questionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const lastSavedRef = useRef<string>("");
  const examDurationRef = useRef<number | undefined>(exam?.duration);
  const handleAutoSaveRef = useRef<() => void>(() => {});
  const handleFinalSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    examDurationRef.current = exam?.duration;
    if (exam) {
      const currentStr = JSON.stringify(exam.sectionList);
      if (!lastSavedRef.current) lastSavedRef.current = currentStr;
    }
  }, [exam]);

  const setQuestionRef = (el: HTMLElement | null, qId: string) => {
    questionRefs.current[qId] = el;
  };

  const handleScrollToQuestion = (qId: string, sectionIdx: number) => {
    setActiveTab(sectionIdx);
    setTimeout(() => {
      const ref = questionRefs.current[qId];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleNextQuestion = () => {
    const nextIdx = Math.min(
      currentQuestionIdx + 1,
      allQuestionsFlat.length - 1,
    );
    const q = allQuestionsFlat[nextIdx];
    if (q) {
      setCurrentQuestionIdx(nextIdx);
      handleScrollToQuestion(q.id, q.sectionIdx);
    }
  };

  const handlePrevQuestion = () => {
    const prevIdx = Math.max(currentQuestionIdx - 1, 0);
    const q = allQuestionsFlat[prevIdx];
    if (q) {
      setCurrentQuestionIdx(prevIdx);
      handleScrollToQuestion(q.id, q.sectionIdx);
    }
  };

  const onPlay = (audio: HTMLAudioElement) => {
    if (currentAudioRef.current && currentAudioRef.current !== audio) {
      currentAudioRef.current.pause();
    }
    currentAudioRef.current = audio;
  };

  const onEnd = () => {
    currentAudioRef.current = null;
  };

  const fetchExam = useCallback(async () => {
    if (!id) return;

    try {
      const resp = await getById(Number(id));

      if (resp.statusCode === HttpStatusCode.Ok) {
        setExam(resp.data);
        setTimeValue(resp.data.duration);
      }
    } catch {
      setAlert({
        open: true,
        message: "Lỗi tải dữ liệu bài thi",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const handleAutoSave = useCallback(async () => {
    if (!exam || !id) return;
    const currentStr = JSON.stringify(exam.sectionList);
    if (currentStr === lastSavedRef.current) return;

    await save(Number(id), exam);
    lastAutoSaveRef.current = timeElapsedRef.current;
    lastSavedRef.current = currentStr;
  }, [exam, id]);

  useEffect(() => {
    handleAutoSaveRef.current = handleAutoSave;
  }, [handleAutoSave]);

  useEffect(() => {
    const timer = setInterval(() => {
      timeElapsedRef.current += 1;
      const duration = examDurationRef.current;
      if (duration && duration > 0) {
        setTimeValue((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinalSubmitRef.current();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeValue((prev) => prev + 1);
      }

      if (timeElapsedRef.current - lastAutoSaveRef.current >= 30) {
        lastAutoSaveRef.current = timeElapsedRef.current;
        handleAutoSaveRef.current();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (qId: string, nextAnswers: AnswerRequest[]) => {
    if (!exam) return;

    setExam((prev) => {
      if (!prev) return null;

      const nextSections = prev.sectionList.map((section) => ({
        ...section,
        questionGroupList: section.questionGroupList.map((group) => ({
          ...group,
          questionGroup: group.questionGroup.map((sub) => ({
            ...sub,
            questionList: sub.questionList.map((q) => {
              if (q.id === qId) {
                const isChanged = !areAnswersEqual(
                  normalizeAnswers(q.selectedAnswer),
                  nextAnswers,
                );
                return {
                  ...q,
                  selectedAnswer: nextAnswers,
                  createdAt: isChanged
                    ? dayjs().format("YYYY-MM-DD HH:mm:ss")
                    : q.createdAt,
                  lateFlag:
                    isChanged &&
                    exam.submitDeadline &&
                    dayjs().isAfter(dayjs(exam.submitDeadline))
                      ? true
                      : q.lateFlag,
                };
              }

              return q;
            }),
          })),
        })),
      }));

      return { ...prev, sectionList: nextSections };
    });
  };

  const areAnswersEqual = (left: AnswerRequest[], right: AnswerRequest[]) => {
    if (left.length !== right.length) return false;
    return left.every(
      (l, i) =>
        l.id === right[i].id &&
        JSON.stringify(l.content) === JSON.stringify(right[i].content),
    );
  };

  const handleTotalPlayedChange = async (ownerId: string) => {
    if (!exam || !id) return;
    let found = false;

    const nextSections = exam.sectionList.map((section) => ({
      ...section,
      questionGroupList: section.questionGroupList.map((group) => {
        if (group.id === ownerId) {
          found = true;
          return { ...group, totalPlayed: (group.totalPlayed ?? 0) + 1 };
        }

        return {
          ...group,
          questionGroup: group.questionGroup.map((sub) => {
            if (sub.id === ownerId) {
              found = true;
              return { ...sub, totalPlayed: (sub.totalPlayed ?? 0) + 1 };
            }

            return {
              ...sub,
              questionList: sub.questionList.map((q) => {
                if (q.id === ownerId) {
                  found = true;
                  return { ...q, totalPlayed: (q.totalPlayed ?? 0) + 1 };
                }

                return q;
              }),
            };
          }),
        };
      }),
    }));

    if (found) {
      const nextExam = { ...exam, sectionList: nextSections };
      setExam(nextExam);
      await save(Number(id), nextExam);
    }
  };

  const handleGetFileUrls = async (
    e: ChangeEvent<HTMLInputElement>,
    expectedType: MATERIAL_TYPE,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return [];

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const isValid =
          (expectedType === MATERIAL_TYPE.IMAGE &&
            file.type.startsWith("image/")) ||
          (expectedType === MATERIAL_TYPE.AUDIO &&
            file.type.startsWith("audio/")) ||
          (expectedType === MATERIAL_TYPE.VIDEO &&
            file.type.startsWith("video/"));

        if (!isValid) {
          setAlert({
            open: true,
            message: `File ${file.name} không đúng định dạng`,
            severity: "error",
          });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        try {
          const resp = await create(formData);
          if (resp.statusCode === HttpStatusCode.Ok && resp.data?.url) {
            urls.push(resp.data.url);
          } else {
            setAlert({
              open: true,
              message: `Lỗi tải file ${file.name}`,
              severity: "error",
            });
          }
        } catch {
          setAlert({
            open: true,
            message: `Lỗi hệ thống khi tải file ${file.name}`,
            severity: "error",
          });
        }
      }
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!exam || !id) return;
    const allQuestions = (exam.sectionList ?? []).flatMap((s: any) =>
      (s.questionGroupList ?? []).flatMap((g: any) =>
        (g.questionGroup ?? []).flatMap((sub: any) => sub.questionList ?? []),
      ),
    );
    const unanswered = allQuestions.filter(
      (q) => q.type !== QUESTION_TYPE.SOURCE_ONLY && !isAnswerFilled(q),
    );

    if (unanswered.length > 0 && timeValue > 0) {
      setAlert({
        open: true,
        message: "Bạn chưa hoàn thành tất cả các câu hỏi.",
        severity: "warning",
      });
      return;
    }

    try {
      const request: ExamSubmitRequest = {
        time: timeElapsedRef.current,
        answerLog: exam.sectionList,
      };
      const resp = await submit(id, request);
      if (resp.statusCode === HttpStatusCode.Ok) {
        navigate(-1);
      } else {
        setAlert({
          open: true,
          message: resp.message || "Lỗi nộp bài",
          severity: "error",
        });
      }
    } catch {
      setAlert({ open: true, message: "Lỗi nộp bài", severity: "error" });
    }
  };

  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  const allQuestionsFlat = useMemo(() => {
    if (!exam) return [];
    const list: (QuestionRequest & { sectionIdx: number })[] = [];
    (exam.sectionList ?? []).forEach((section: any, sIdx: number) => {
      (section.questionGroupList ?? []).forEach((group: any) => {
        (group.questionGroup ?? []).forEach((subGroup: any) => {
          (subGroup.questionList ?? []).forEach((q: QuestionRequest) => {
            if (q.type !== QUESTION_TYPE.SOURCE_ONLY) {
              list.push({ ...q, sectionIdx: sIdx });
            }
          });
        });
      });
    });
    return list;
  }, [exam]);

  if (loading || !exam) {
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{ color: "primary.main" }}
        />
      </Box>
    );
  }

  const currentSection = exam.sectionList[activeTab];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.100",
          bgcolor: "white",
        }}
      >
        <Box sx={{ width: "100%", px: 2, py: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Book size={32} variant="Bulk" color="#2563eb" />
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  {exam.name}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Tổng số câu hỏi: {allQuestionsFlat.length}
                </Typography>

                {exam.submitDeadline && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", fontWeight: 700 }}
                  >
                    Hạn nộp:{" "}
                    {dayjs(exam.submitDeadline).format("HH:mm DD/MM/YYYY")}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ width: "100%", px: 2, mt: 2 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          {/* Main Content Area */}
          <Box sx={{ width: { xs: "100%", lg: "85%" } }}>
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                  "& .MuiTab-root": {
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    minWidth: 120,
                    color: "text.secondary",
                    pb: 1.5,
                  },
                  "& .Mui-selected": { color: "primary.main" },
                }}
              >
                {exam.sectionList.map((section, idx) => (
                  <Tab
                    key={section.id}
                    label={section.name || `Phần ${idx + 1}`}
                  />
                ))}
              </Tabs>

              <Divider sx={{ mt: -0.125 }} />
            </Box>

            <Box>
              {currentSection?.questionGroupList.map((group, idx) => (
                <TaskBlock
                  key={group.id}
                  index={idx}
                  group={group}
                  setRef={setQuestionRef}
                  onAnswerChange={handleAnswerChange}
                  handleGetFileUrls={handleGetFileUrls}
                  currentAudioRef={currentAudioRef}
                  onPlay={onPlay}
                  onEnd={onEnd}
                  exam={exam}
                  handleTotalPlayedChange={handleTotalPlayedChange}
                  activeQuestionId={allQuestionsFlat[currentQuestionIdx]?.id}
                />
              ))}
            </Box>
          </Box>

          {/* Sidebar Navigator */}
          <Box sx={{ width: { xs: "100%", lg: "15%" } }}>
            <Stack
              sx={{
                position: { lg: "sticky" },
                top: 110,
                width: "100%",
                gap: 2.5,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  bgcolor: alpha("#2563eb", 0.04),
                  borderColor: alpha("#3b82f6", 0.15),
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.05)",
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: timeValue < 300 ? "error.main" : "primary.main",
                    display: "flex",
                  }}
                >
                  <Timer1 size={24} color="#FFF" variant="Bulk" />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: timeValue < 300 ? "error.main" : "primary.main",
                      minWidth: 140,
                      fontFamily: "monospace",
                    }}
                  >
                    {formatTime(timeValue)}
                  </Typography>
                </Box>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "grey.200",
                    borderRadius: 4,
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2.5,
                    fontWeight: 700,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  DANH SÁCH CÂU HỎI
                </Typography>

                <Stack spacing={3}>
                  {(exam.sectionList ?? []).map((section, sIdx) => {
                    const sectionQuestions = (
                      section.questionGroupList ?? []
                    ).flatMap((group: any) =>
                      (group.questionGroup ?? []).flatMap((sub: any) =>
                        (sub.questionList ?? []).filter(
                          (q: QuestionRequest) =>
                            q.type !== QUESTION_TYPE.SOURCE_ONLY,
                        ),
                      ),
                    );

                    if (sectionQuestions.length === 0) return null;

                    return (
                      <Box key={section.id}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 1,
                            fontWeight: 700,
                            color: "primary.main",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {section.name || `Phần ${sIdx + 1}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 1,
                          }}
                        >
                          {sectionQuestions.map((q: QuestionRequest) => {
                            const isFilled = isAnswerFilled(q);
                            const absIdx = allQuestionsFlat.findIndex(
                              (item: any) => item.id === q.id,
                            );
                            return (
                              <Box
                                key={q.id}
                                onClick={() => {
                                  setCurrentQuestionIdx(absIdx);
                                  handleScrollToQuestion(q.id, sIdx);
                                }}
                                sx={{
                                  aspectRatio: "1",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  transition: "all 0.2s",
                                  bgcolor: isFilled ? "#DFE4FE" : "#F8F9FA",
                                  color: isFilled ? "#3F7DF8" : "#718096",
                                  border: "1px solid",
                                  borderColor: isFilled ? "#C3DAFE" : "#E2E8F0",
                                  "&:hover": {
                                    transform: "scale(1.15)",
                                    borderColor: "primary.main",
                                    boxShadow:
                                      "0 4px 12px -2px rgba(59, 130, 246, 0.2)",
                                  },
                                }}
                              >
                                {q.serialNumber}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>

              <Stack spacing={1} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    startIcon={<ArrowLeft2 size={16} />}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIdx === 0}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    endIcon={<ArrowRight2 size={16} />}
                    onClick={handleNextQuestion}
                    disabled={
                      currentQuestionIdx === allQuestionsFlat.length - 1
                    }
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Sau
                  </Button>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleFinalSubmit}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: "1rem",
                    boxShadow: (theme) =>
                      `0 10px 15px -3px ${alpha(
                        theme.palette.primary.main,
                        0.3,
                      )}`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) =>
                        `0 12px 20px -3px ${alpha(
                          theme.palette.primary.main,
                          0.4,
                        )}`,
                    },
                    transition: "all 0.2s",
                  }}
                >
                  Nộp bài
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          variant="filled"
          sx={{ borderRadius: 2, minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <OverlayLoader open={isUploading} message="Đang tải tệp tin lên..." />
    </Box>
  );
}
