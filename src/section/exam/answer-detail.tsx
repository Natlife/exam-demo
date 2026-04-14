import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ExamScoreReportDetail } from "@/types/assignment";
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
  Paper,
  Radio,
  Rating,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { HttpStatusCode } from "axios";
import {
  ArrowLeft2,
  ArrowRight2,
  TickCircle,
  VolumeHigh,
  Danger,
  Book,
  Timer1,
} from "iconsax-reactjs";
import { useIntl, FormattedMessage } from "react-intl";
import { getAnswerById } from "@/api/exam";
import { TiptapReadOnly } from "./components/PreviewModal";
import { MediaRenderer } from "./components/MediaRenderer";

// --- Shared Helper Components for Review (Read-only) ---

const hasSource = (item?: sourceRequest | null) =>
  Boolean(item?.source?.trim());
const hasVisibleItems = (items?: sourceRequest[]) =>
  (items ?? []).some(hasSource);

const normalizeAnswers = (answers?: AnswerRequest[]) => answers ?? [];
const getSelectedContent = (question: QuestionRequest) =>
  question.selectedAnswer?.[0]?.content ?? [];

const formatTime = (totalSeconds: number) => {
  if (totalSeconds < 0 || Number.isNaN(totalSeconds)) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const SourceItemCard = ({
  item,
  audioRef,
  onPlay,
  onEnd,
  compact = false,
}: {
  item: sourceRequest;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  compact?: boolean;
}) => {
  if (!hasSource(item)) return null;
  if (item.type === MATERIAL_TYPE.TEXT)
    return <TiptapReadOnly value={item.source} />;

  if (item.type === MATERIAL_TYPE.AUDIO) {
    return (
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          p: compact ? 2 : 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              p: 1,
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <VolumeHigh size={20} color="#2563eb" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Audio
            </Typography>
          </Box>
        </Box>

        <audio
          controls
          controlsList="nodownload"
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
  audioRef,
  onPlay,
  onEnd,
}: {
  question: QuestionRequest;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
}) => {
  const selectedAnswer = normalizeAnswers(question.selectedAnswer);
  const validAnswers = (question.answerList ?? []).filter(
    (a) => a.content.length > 0 && hasSource(a.content[0])
  );

  return (
    <Stack spacing={1.5}>
      {validAnswers.map((answer) => {
        const firstContent = answer.content[0];
        const isSelected = selectedAnswer.some((item) => item.id === answer.id);
        const isCorrect = answer.isCorrect === 1;

        let borderColor = "grey.200";
        let backgroundColor = "white";

        if (isCorrect) {
          borderColor = "success.main";
          backgroundColor = alpha("#2e7d32", 0.06);
        } else if (isSelected) {
          borderColor = "error.main";
          backgroundColor = alpha("#d32f2f", 0.06);
        }

        return (
          <Box
            key={answer.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "2px solid",
              borderColor,
              bgcolor: backgroundColor,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              transition: "all 0.2s ease",
            }}
          >
            {question.isMultipleChoice ? (
              <Checkbox checked={isSelected} readOnly sx={{ p: 0, mt: 0.25 }} />
            ) : (
              <Radio checked={isSelected} readOnly sx={{ p: 0, mt: 0.25 }} />
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

              {isCorrect && (
                <Box
                  sx={{
                    mt: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: "success.main",
                  }}
                >
                  <TickCircle size={16} variant="Bold" />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Đáp án đúng
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const EssayAnswerDisplay = ({
  question,
  audioRef,
  onPlay,
  onEnd,
}: {
  question: QuestionRequest;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
}) => {
  const selectedContent = getSelectedContent(question);
  const textSlot = selectedContent.find(
    (item) => item.type === MATERIAL_TYPE.TEXT
  );
  const uploadedMedia = selectedContent.filter(
    (item) => item.type !== MATERIAL_TYPE.TEXT && hasSource(item)
  );

  return (
    <Stack spacing={2}>
      {question.isNote && textSlot?.subContent && (
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
            Ghi chú / Dàn ý
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50" }}
          >
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {textSlot.subContent}
            </Typography>
          </Paper>
        </Box>
      )}

      {textSlot?.source && (
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
            Bài làm
          </Typography>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <TiptapReadOnly value={textSlot.source} />
          </Paper>
        </Box>
      )}

      {uploadedMedia.length > 0 && (
        <Grid container spacing={2}>
          {uploadedMedia.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 6 }}>
              <SourceItemCard
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
};

const FillAnswerDisplay = ({ question }: { question: QuestionRequest }) => {
  const selectedContent = getSelectedContent(question);
  const textSlot = selectedContent.find(
    (item) => item.type === MATERIAL_TYPE.TEXT
  );
  const value = textSlot?.source ?? "";
  const isFilled = value.trim().length > 0;

  const validAnswers = (question.answerList ?? []).filter(
    (a) => a.content.length > 0 && hasSource(a.content[0])
  );
  const normalize = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();
  const isCorrect =
    (question.selectedAnswer?.[0] as any)?.isCorrect === 1 ||
    validAnswers.some(
      (ans) => normalize(ans.content[0].source) === normalize(value)
    );

  const borderColor = isFilled
    ? isCorrect
      ? "success.main"
      : "error.main"
    : "grey.300";
  const bgColor = isFilled
    ? isCorrect
      ? alpha("#2e7d32", 0.04)
      : alpha("#d32f2f", 0.04)
    : "grey.50";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: bgColor,
          borderColor,
          borderWeight: 2,
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: isFilled
              ? isCorrect
                ? "success.dark"
                : "error.dark"
              : "text.secondary",
          }}
        >
          {value || "Chưa có câu trả lời"}
        </Typography>
      </Paper>

      {!isCorrect && validAnswers.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "success.main",
            mt: 0.5,
            px: 1,
          }}
        >
          <TickCircle size={16} variant="Bold" />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Đáp án đúng:{" "}
            {validAnswers.map((a) => a.content[0].source).join(" | ")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const QuestionBlockReview = ({
  question,
  setRef,
  audioRef,
  onPlay,
  onEnd,
  activeQuestionId,
}: {
  question: QuestionRequest;
  setRef: (el: HTMLElement | null, id: string) => void;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  activeQuestionId?: string;
}) => {
  const showNumber = question.type !== QUESTION_TYPE.SOURCE_ONLY;
  const isCorrectStatus =
    question.selectedAnswer?.[0] &&
    (question.selectedAnswer?.[0] as any).isCorrect === 1;
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
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: isCorrectStatus ? "success.main" : "error.main",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {question.serialNumber !== 0 &&
                `Câu hỏi ${question.serialNumber}:`}{" "}
              {isCorrectStatus ? "Đúng" : "Sai"}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {hasVisibleItems(question.content) && (
            <Stack spacing={1.5}>
              {question.content.map((item) => (
                <SourceItemCard
                  key={item.id}
                  item={item}
                  audioRef={audioRef}
                  onPlay={onPlay}
                  onEnd={onEnd}
                />
              ))}
            </Stack>
          )}

          {question.type === QUESTION_TYPE.MCQ && (
            <Box>
              <QuestionAnswerOptions
                question={question}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
              />
            </Box>
          )}
          {question.type === QUESTION_TYPE.ESSAY && (
            <Box>
              <EssayAnswerDisplay
                question={question}
                audioRef={audioRef}
                onPlay={onPlay}
                onEnd={onEnd}
              />
            </Box>
          )}
          {question.type === QUESTION_TYPE.FILL && (
            <FillAnswerDisplay question={question} />
          )}

          {/* Teacher Review / Explanation */}
          {question.gradingExplanation?.trim() && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha("#2563eb", 0.04),
                borderColor: alpha("#2563eb", 0.12),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                Hướng dẫn chấm
              </Typography>
              <Box sx={{ mt: 1 }}>
                <TiptapReadOnly value={question.gradingExplanation} />
              </Box>
            </Paper>
          )}

          {question.explanation?.trim() && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.50",
                borderLeft: "4px solid",
                borderLeftColor: "success.light",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "success.main",
                  fontWeight: 700,
                }}
              >
                Giải thích
              </Typography>
              <Box sx={{ mt: 1 }}>
                <TiptapReadOnly value={question.explanation} />
              </Box>
            </Paper>
          )}

          {question.review?.trim() && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#fff9db",
                borderColor: "#ffe066",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Danger size={18} color="#f08c00" variant="Bold" />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: "#f08c00",
                    textTransform: "uppercase",
                  }}
                >
                  Nhận xét của giáo viên
                </Typography>
              </Stack>
              <TiptapReadOnly value={question.review} />
            </Paper>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

const TaskBlockReview = ({
  group,
  setRef,
  currentAudioRef,
  onPlay,
  onEnd,
  index,
  activeQuestionId,
}: {
  group: QuestionGroupListRequest;
  setRef: (el: HTMLElement | null, id: string) => void;
  currentAudioRef?: React.Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  index: number;
  activeQuestionId?: string;
}) => {
  const visibleTitle = (group.title ?? []).filter(hasSource);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 2,
        bgcolor: "white",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 6,
          height: "100%",
          bgcolor: "primary.main",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />
      {visibleTitle.length > 0 && (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {visibleTitle.map((item) => (
            <SourceItemCard
              key={item.id}
              item={item}
              audioRef={currentAudioRef}
              onPlay={onPlay}
              onEnd={onEnd}
            />
          ))}
        </Stack>
      )}

      <Stack spacing={6}>
        {group.questionGroup.map((subGroup, idx) => {
          const hasSubContent = hasVisibleItems(subGroup.content);
          return (
            <Box key={subGroup.id}>
              <Grid container spacing={hasSubContent ? 2 : 0}>
                {/* Sub-group Content (Split Left) */}
                {hasSubContent && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        borderLeft: "4px solid",
                        borderLeftColor: "primary.light",
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
                            audioRef={currentAudioRef}
                            onPlay={onPlay}
                            onEnd={onEnd}
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
                      "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                    }}
                  >
                    <Stack spacing={5}>
                      {subGroup.questionList.map((q) => (
                        <QuestionBlockReview
                          key={q.id}
                          question={q}
                          setRef={setRef}
                          audioRef={currentAudioRef}
                          onPlay={onPlay}
                          onEnd={onEnd}
                          activeQuestionId={activeQuestionId}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
              {idx < group.questionGroup.length - 1 && (
                <Divider sx={{ mt: 6, borderStyle: "dashed" }} />
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// --- Main Answer Detail Page ---

export default function ExamAnswerDetail() {
  const { id, classId } = useParams<{ id: string; classId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamScoreReportDetail | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const questionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const setQuestionRef = (el: HTMLElement | null, qId: string) => {
    questionRefs.current[qId] = el;
  };

  const onPlay = (audio: HTMLAudioElement) => {
    if (currentAudioRef.current && currentAudioRef.current !== audio)
      currentAudioRef.current.pause();
    currentAudioRef.current = audio;
  };

  const onEnd = () => {
    currentAudioRef.current = null;
  };

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!id) return;

      try {
        const resp = await getAnswerById(Number(id));
        if (resp.statusCode === HttpStatusCode.Ok) setExam(resp.data);
      } catch {
        setAlert({
          open: true,
          message: "Lỗi tải kết quả bài thi",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [id]);

  const allQuestionsFlat = useMemo(() => {
    if (!exam) return [];
    return exam.gradingList.flatMap((s, sIdx) =>
      s.questionGroupList.flatMap((g) =>
        g.questionGroup.flatMap((sub) =>
          sub.questionList
            .filter(
              (q) =>
                q.serialNumber !== 0 && q.type !== QUESTION_TYPE.SOURCE_ONLY
            )
            .map((q) => ({ ...q, sectionIdx: sIdx }))
        )
      )
    );
  }, [exam]);

  const handleScrollToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= allQuestionsFlat.length) return;
      setCurrentQuestionIdx(index);
      const question = allQuestionsFlat[index];
      setActiveTab(question.sectionIdx);

      setTimeout(() => {
        const el = questionRefs.current[question.id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          const fallbackEl = document.getElementById(question.id);
          if (fallbackEl)
            fallbackEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    },
    [allQuestionsFlat]
  );

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
        <CircularProgress size={48} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const currentSection = exam.gradingList[activeTab];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      {/* Non-sticky Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.100",
          bgcolor: "white",
        }}
      >
        <Box sx={{ width: "100%", px: 2, py: 2.5 }}>
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
                  Kết quả: {exam.name}
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
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Thời gian làm bài: {formatTime(exam.time)}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 700,
                  }}
                >
                  Điểm số
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Rating
                    value={Number(exam.score ?? 0)}
                    readOnly
                    size="small"
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "primary.main" }}
                  >
                    {exam.score} / 5
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/student/dashboard/detail/${classId}`)}
                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                <FormattedMessage id="back-to-course" />
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ width: "100%", px: 2, mt: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
          {/* Main Question Flow */}
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
                    fontSize: "0.9rem",
                    textTransform: "none",
                    minWidth: 100,
                    color: "text.secondary",
                  },
                  "& .Mui-selected": { color: "primary.main" },
                }}
              >
                {exam.gradingList.map((section, idx) => (
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
                <TaskBlockReview
                  key={group.id}
                  index={idx}
                  group={group}
                  setRef={setQuestionRef}
                  currentAudioRef={currentAudioRef}
                  onPlay={onPlay}
                  onEnd={onEnd}
                  activeQuestionId={allQuestionsFlat[currentQuestionIdx]?.id}
                />
              ))}
            </Box>
          </Box>

          {/* Side Feedback Section (Sticky Sidebar) */}
          <Box sx={{ width: { xs: "100%", lg: "15%" } }}>
            <Stack spacing={3} sx={{ position: "sticky", top: 110 }}>
              {exam.review && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha("#2563eb", 0.04),
                    borderColor: alpha("#2563eb", 0.12),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 800,
                      color: "primary.main",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Nhận xét chung
                  </Typography>
                  <TiptapReadOnly value={exam.review} />
                </Paper>
              )}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: "text.secondary",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  THEO DÕI CÂU HỎI
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 1,
                  }}
                >
                  {allQuestionsFlat.map((q, idx) => {
                    const isCorrect =
                      q.selectedAnswer?.[0] &&
                      (q.selectedAnswer[0] as any).isCorrect === 1;
                    const isActive = currentQuestionIdx === idx;
                    return (
                      <Box
                        key={q.id}
                        onClick={() => handleScrollToQuestion(idx)}
                        sx={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          transition: "all 0.2s",
                          bgcolor: isCorrect ? "success.main" : "error.main",
                          color: "white",
                          border: isActive ? "2px solid" : "none",
                          borderColor: "primary.main",
                          boxShadow: isActive
                            ? (theme) =>
                                `0 0 0 2px white, 0 0 0 4px ${theme.palette.primary.main}`
                            : "none",
                          "&:hover": {
                            transform: "scale(1.15)",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        {idx + 1}
                      </Box>
                    );
                  })}
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ArrowLeft2 size={18} />}
                    disabled={currentQuestionIdx === 0}
                    onClick={() =>
                      handleScrollToQuestion(currentQuestionIdx - 1)
                    }
                    sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
                  >
                    Trước
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowRight2 size={18} />}
                    disabled={
                      currentQuestionIdx === allQuestionsFlat.length - 1
                    }
                    onClick={() =>
                      handleScrollToQuestion(currentQuestionIdx + 1)
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      fontWeight: 700,
                      bgcolor: "primary.main",
                    }}
                  >
                    Sau
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

