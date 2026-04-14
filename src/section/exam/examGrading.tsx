import { Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Rating,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import {
  Danger,
  VolumeHigh,
  TickCircle,
  CloseCircle,
  ArrowLeft2,
  Book,
  Copy,
} from "iconsax-reactjs";

import {
  getGradingExam,
  submitGradingExam,
  updateGradingExam,
} from "@/api/scoreReport";
import {
  AnswerRequest,
  QUESTION_TYPE,
  MATERIAL_TYPE,
  QuestionRequest,
  SectionRequest,
  sourceRequest,
  GRADING_STATUS,
} from "@/types/question";
import {
  ExamScoreReportDetail,
  ExamGradingReviewRequest,
  QuestionReviewRequest,
} from "@/types/assignment";

import { RichTextEditor } from "@/components/RickTextEditor";
import { deltaToPlainText } from "@/utils/delta/deltaConverter";
import { TiptapReadOnly } from "./components/PreviewModal";
import { SourceItemCard } from "./detail";

// --- Shared grading specific components ---

const hasSource = (item: sourceRequest) => Boolean(item?.source?.trim());
const hasVisibleItems = (items: sourceRequest[]) => items.some(hasSource);

const GradingQuestionBlock = ({
  question,
  setRef,
  isGradingMode,
  reviewValue,
  isCorrect,
  onReviewChange,
  onCorrectToggle,
  isAllGradingDone,
  audioRef,
  onPlay,
  onEnd,
  activeQuestionId,
}: {
  question: QuestionRequest;
  setRef: (el: HTMLElement | null, id: string) => void;
  isGradingMode: boolean;
  reviewValue: string;
  isCorrect: boolean;
  onReviewChange: (val: string) => void;
  onCorrectToggle: () => void;
  isAllGradingDone: boolean;
  audioRef?: Ref<HTMLAudioElement> | null;
  onPlay: (audio: HTMLAudioElement) => void;
  onEnd: () => void;
  activeQuestionId?: string;
}) => {
  const selectedAnswer: AnswerRequest[] = useMemo(
    () => question.selectedAnswer ?? [],
    [question.selectedAnswer],
  );
  const showNumber = question.type !== QUESTION_TYPE.SOURCE_ONLY;

  const isActive = activeQuestionId === question.id;

  return (
    <Box
      id={question.id}
      ref={(el: HTMLElement | null) => setRef(el, question.id)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        borderRadius: 2,
        transition: "all 0.3s ease-in-out",
        border: isActive ? "2px solid" : "2px solid transparent",
        borderColor: isActive ? "primary.main" : "transparent",
        bgcolor: isActive ? alpha("#2563eb", 0.04) : "transparent",
        scrollMarginTop: "120px",
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
                bgcolor: "primary.main",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Câu hỏi {question.serialNumber}:
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
          {(question.content ?? []).filter(hasSource).length > 0 && (
            <Stack spacing={1.5}>
              {(question.content ?? []).filter(hasSource).map((item) => (
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
            <Stack spacing={1.5}>
              {(question.answerList ?? []).map((answer) => {
                const isSelected = selectedAnswer.some(
                  (a) => a.id === answer.id,
                );
                const isCorrectAns = answer.isCorrect === 1;
                let borderColor = "grey.200";
                let bgColor = "white";
                if (isCorrectAns) {
                  borderColor = "success.main";
                  bgColor = alpha("#2e7d32", 0.06);
                } else if (isSelected) {
                  borderColor = "error.main";
                  bgColor = alpha("#d32f2f", 0.06);
                }
                return (
                  <Box
                    key={answer.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor,
                      bgcolor: bgColor,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", pt: 0.25 }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor,
                          bgcolor: isSelected ? borderColor : "transparent",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      {(answer.content ?? [])
                        .filter(hasSource)
                        .map((item: any) => (
                          <SourceItemCard
                            key={item.id}
                            item={item}
                            onPlay={onPlay}
                            onEnd={onEnd}
                            compact
                          />
                        ))}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          {question.type === QUESTION_TYPE.FILL &&
            (() => {
              const val = (selectedAnswer[0]?.content ?? [])[0]?.source ?? "";
              const validAnswers = (question.answerList ?? []).filter((a) =>
                (a.content ?? [])[0]?.source?.trim(),
              );
              const isCorr =
                selectedAnswer[0]?.isCorrect === 1 ||
                validAnswers.some(
                  (a) =>
                    a.content[0].source.trim().toLowerCase() ===
                    val.trim().toLowerCase(),
                );
              const correctAnswersText = validAnswers
                .map((a) => a.content[0].source)
                .join(" | ");

              return (
                <Box>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: val.trim()
                        ? isCorr
                          ? alpha("#2e7d32", 0.04)
                          : alpha("#d32f2f", 0.04)
                        : "grey.50",
                      borderColor: val.trim()
                        ? isCorr
                          ? "success.main"
                          : "error.main"
                        : "grey.300",
                    }}
                  >
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: val.trim()
                          ? isCorr
                            ? "success.dark"
                            : "error.dark"
                          : "text.secondary",
                      }}
                    >
                      {val || "Chưa có câu trả lời"}
                    </Typography>
                  </Paper>
                  {!isCorr && correctAnswersText && (
                    <Typography
                      variant="caption"
                      sx={{ color: "success.main", mt: 1, display: "block" }}
                    >
                      Đáp án đúng: {correctAnswersText}
                    </Typography>
                  )}
                </Box>
              );
            })()}

          {question.type === QUESTION_TYPE.ESSAY &&
            (() => {
              const contents = selectedAnswer[0]?.content ?? [];
              const hasAnyContent = contents.some((c) => c.source?.trim());
              if (!hasAnyContent) return null;

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
                    Bài làm
                  </Typography>
                  <Stack spacing={1.5}>
                    {contents
                      .filter((c) => c.source?.trim())
                      .map((c) =>
                        c.type === MATERIAL_TYPE.TEXT ? (
                          <Paper
                            key={c.id}
                            variant="outlined"
                            sx={{ p: 2.5, borderRadius: 2 }}
                          >
                            <TiptapReadOnly value={c.source} />
                          </Paper>
                        ) : (
                          <SourceItemCard
                            key={c.id}
                            item={c}
                            audioRef={audioRef}
                            onPlay={onPlay}
                            onEnd={onEnd}
                            compact
                          />
                        ),
                      )}
                  </Stack>
                </Box>
              );
            })()}

          {question.explanation?.trim() && (
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
                Giải thích
              </Typography>
              <Box sx={{ mt: 1 }}>
                <TiptapReadOnly value={question.explanation} />
              </Box>
            </Paper>
          )}

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

          {isAllGradingDone
            ? (question.review?.trim() ||
                (isCorrect !== undefined &&
                  question.type === QUESTION_TYPE.ESSAY)) && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Chấm bài / Nhận xét của giáo viên:
                    </Typography>
                    {question.type === QUESTION_TYPE.ESSAY && (
                      <Chip
                        label={isCorrect ? "Đúng" : "Sai"}
                        color={isCorrect ? "success" : "error"}
                        variant="filled"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Box>
                  {question.review?.trim() && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
                    >
                      <Box sx={{ mt: 1 }}>
                        <TiptapReadOnly value={question.review} />
                      </Box>
                    </Paper>
                  )}
                </Box>
              )
            : onReviewChange &&
              isCorrect !== undefined &&
              question.type === QUESTION_TYPE.ESSAY && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Chữa bài của giáo viên:
                    </Typography>
                    {question.type === QUESTION_TYPE.ESSAY && (
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label="Sai"
                          color={!isCorrect ? "error" : "default"}
                          variant={!isCorrect ? "filled" : "outlined"}
                          onClick={() => isCorrect && onCorrectToggle?.()}
                          size="small"
                          sx={{ fontWeight: 700, cursor: "pointer" }}
                        />
                        <Chip
                          label="Đúng"
                          color={isCorrect ? "success" : "default"}
                          variant={isCorrect ? "filled" : "outlined"}
                          onClick={() => onCorrectToggle?.()}
                          size="small"
                          sx={{ fontWeight: 700, cursor: "pointer" }}
                        />
                      </Stack>
                    )}
                  </Box>
                  <RichTextEditor
                    key={`review-${question.id}`}
                    value={reviewValue}
                    placeholder="Nhập nội dung chữa bài cho học sinh..."
                    onChange={onReviewChange}
                  />
                </Box>
              )}
        </Box>
      </Stack>
    </Box>
  );
};

// --- Teacher Grading Main Component ---

export default function TeacherGrading() {
  const { classId: classIdParam, sessionId: sessionIdParam, studentId, examId } = useParams<{
    classId: string;
    sessionId: string;
    studentId: string;
    examId: string;
  }>();
  // Fallback for classId/sessionId when not in URL (route: /exams/grade/:examId/student/:studentId)
  const classId = classIdParam ?? '1';
  const sessionId = sessionIdParam ?? '1';
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<ExamScoreReportDetail | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAllGradingDone, setIsAllGradingDone] = useState(false);

  const [questionReviews, setQuestionReviews] = useState<{
    [qId: string]: { content: string; isCorrect: boolean };
  }>({});
  const reviewsRef = useRef(questionReviews);
  const [examReview, setExamReview] = useState("");
  const examReviewRef = useRef(examReview);
  const [examScore, setExamScore] = useState(0);
  const examScoreRef = useRef(examScore);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(-1);

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

  const onPlay = (audio: HTMLAudioElement) => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    currentAudioRef.current = audio;
  };
  const onEnd = () => {
    currentAudioRef.current = null;
  };

  const fetchExam = useCallback(async () => {
    if (!classId || !sessionId || !studentId || !examId) return;

    try {
      const resp = await getGradingExam(
        classId!,
        sessionId!,
        examId!,
        studentId!,
      );
      if (resp.statusCode === HttpStatusCode.Ok) {
        setExam(resp.data);
        setIsAllGradingDone(
          resp.data.gradingStatus === GRADING_STATUS.LATE ||
            resp.data.gradingStatus === GRADING_STATUS.COMPLETED,
        );
        setExamReview(resp.data.review ?? "");
        setExamScore(resp.data.score ?? 0);

        const initialReviews: {
          [qId: string]: { content: string; isCorrect: boolean };
        } = {};
        resp.data.gradingList.forEach((s: SectionRequest) => {
          s.questionGroupList.forEach((gl) =>
            gl.questionGroup.forEach((sg) =>
              sg.questionList.forEach((q) => {
                if (q.review || q.selectedAnswer?.[0]) {
                  initialReviews[q.id] = {
                    content: q.review ?? "",
                    isCorrect: (q.selectedAnswer?.[0] as any)?.isCorrect === 1,
                  };
                }
              }),
            ),
          );
        });

        setQuestionReviews(initialReviews);
        console.log("ini:", initialReviews);
      }
    } catch {
      setAlert({ open: true, message: "Lỗi tải bài làm", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [classId, sessionId, studentId, examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    reviewsRef.current = questionReviews;
  }, [questionReviews]);

  useEffect(() => {
    examReviewRef.current = examReview;
  }, [examReview]);

  useEffect(() => {
    examScoreRef.current = examScore;
  }, [examScore]);

  const handleReviewUpdate = (
    qId: string,
    patch: Partial<{ content: string; isCorrect: boolean }>,
  ) => {
    setQuestionReviews((prev) => ({
      ...prev,
      [qId]: {
        content: patch.content ?? prev[qId]?.content ?? "",
        isCorrect: patch.isCorrect ?? prev[qId]?.isCorrect ?? false,
      },
    }));
  };

  const copyExamToText = () => {
    if (!exam) return;
    let textOutput = `DANH SÁCH BÀI THI VÀ BÀI LÀM CỦA HỌC SINH: ${exam.name.toUpperCase()}\n`;
    textOutput += "==========================================\n\n";

    const getCleanText = (content?: string | null) => {
      try {
        if (!content) return "";
        if (content.startsWith("{") || content.startsWith("[")) {
          return deltaToPlainText(JSON.parse(content));
        }
        return content;
      } catch (e: any) {
        return content || "";
      }
    };

    const getCleanTextFromSource = (
      items?: { type: number; source: string; subContent?: string }[],
    ) => {
      if (!items || !items.length) return "";
      return items
        .filter((item) => item.source?.trim())
        .map((item) => {
          if (item.type === 0) return getCleanText(item.source);
          if (item.type === 1) return "[Hình ảnh]";
          if (item.type === 2) return "[Âm thanh]";
          if (item.type === 3) return "[Video]";
          return "";
        })
        .filter((x) => x)
        .join("\n");
    };

    exam.gradingList.forEach((section, sIdx) => {
      textOutput += `PHẦN ${sIdx + 1}: ${
        section.name?.toUpperCase() || "KHÔNG TÊN"
      }\n`;
      textOutput += `------------------------------------------\n`;
      let questionIndex = 0;

      section.questionGroupList.forEach((groupListItem) => {
        const titleContent = getCleanTextFromSource(groupListItem.title);
        if (titleContent.trim()) {
          textOutput += `[Tiêu đề nhóm]: ${titleContent}\n`;
        }

        groupListItem.questionGroup.forEach((group) => {
          const groupContent = getCleanTextFromSource(group.content);
          if (groupContent.trim()) {
            textOutput += `[Nội dung câu hỏi nhóm]: ${groupContent}\n`;
          }

          group.questionList.forEach((question) => {
            if (question.type === QUESTION_TYPE.SOURCE_ONLY) return;

            const questionContent = getCleanTextFromSource(question.content);
            questionIndex += 1;
            textOutput += `Câu hỏi ${
              question.serialNumber || questionIndex
            }: ${questionContent}\n`;

            const r = reviewsRef.current[question.id];
            const answerItems = question.selectedAnswer?.[0]?.content ?? [];
            const studentAnswer =
              answerItems.length > 0
                ? getCleanTextFromSource(answerItems)
                : "Học sinh chưa trả lời";

            textOutput += `=> Bài làm của học sinh: ${studentAnswer}\n`;

            if (question.note) {
              textOutput += `Ghi chú yêu cầu đề bài: ${getCleanText(
                question.note,
              )}\n`;
            }

            if (r?.content?.trim()) {
              textOutput += `=> Nhận xét của giáo viên: ${getCleanText(
                r.content,
              )}\n`;
            }

            if (question.type !== QUESTION_TYPE.ESSAY) {
              textOutput += `=> Đánh giá: ${r?.isCorrect ? "ĐÚNG" : "SAI"}\n`;
            }
            if (question?.explanation?.trim()) {
              textOutput += `=> Giải thích: ${getCleanText(
                question.explanation,
              )}\n`;
            }
            textOutput += `\n`;
          });
        });
      });
      textOutput += `\n`;
    });

    if (examReviewRef.current?.trim()) {
      textOutput += `==========================================\n`;
      textOutput += `NHẬN XÉT CHUNG: ${getCleanText(examReviewRef.current)}\n`;
      textOutput += `ĐIỂM TỔNG KẾT: ${
        examScoreRef.current === 5
          ? "ĐẠT"
          : examScoreRef.current === 1
            ? "KHÔNG ĐẠT"
            : examScoreRef.current
      }\n`;
    }

    navigator.clipboard
      .writeText(textOutput.trim())
      .then(() => {
        setAlert({
          open: true,
          message: "Đã copy văn bản thuần vào Clipboard!",
          severity: "success",
        });
      })
      .catch((err) => {
        setAlert({
          open: true,
          message: "Lỗi khi copy: " + err,
          severity: "error",
        });
      });
  };

  const getReviewPayload = () => {
    if (!exam) return null;
    return {
      examId: Number(examId),
      score: examScoreRef.current,
      review: examReviewRef.current,
      sectionList: exam.gradingList.map((section) => ({
        sectionId: section.id,
        questionReviews: section.questionGroupList.flatMap((gl) =>
          gl.questionGroup.flatMap((sg) =>
            sg.questionList.map((q) => {
              const r = reviewsRef.current[q.id];
              return {
                questionId: q.id,
                review: r?.content ?? "",
                isCorrect: r?.isCorrect ? 1 : 0,
                gradedAt:
                  r?.content === (q.review ?? "") &&
                  (r?.isCorrect ?? false) ===
                    (q.selectedAnswer?.[0]?.isCorrect === 1)
                    ? q.gradedAt
                    : dayjs().format("YYYY-MM-DD HH:mm:ss"),
              };
            }),
          ),
        ),
      })),
    };
  };

  const handleSave = async (isFinal: boolean) => {
    const payload = getReviewPayload();

    if (!payload || !studentId || !sessionId || !classId) return;

    if (isFinal && payload.score <= 0) {
      setAlert({
        open: true,
        message: "Vui lòng đánh giá điểm trước khi nộp bài chấm",
        severity: "warning",
      });
      return;
    }

    try {
      const resp = isFinal
        ? await submitGradingExam(
            Number(classId),
            Number(sessionId),
            Number(studentId),
            payload,
          )
        : await updateGradingExam(
            Number(classId),
            Number(sessionId),
            Number(studentId),
            payload,
          );

      if (resp.statusCode === HttpStatusCode.Ok) {
        setAlert({
          open: true,
          message: isFinal
            ? "Lưu kết quả chấm bài thành công"
            : "Đã lưu nháp kết quả chấm bài",
          severity: "success",
        });
        setTimeout(
          () =>
            navigate(`/exams`, {
              state: {
                tabIndex: 3,
              },
            }),
          1000,
        );
      }
    } catch {
      setAlert({ open: true, message: "Lỗi lưu kết quả", severity: "error" });
    }
  };

  const allQuestionsFlat = useMemo(() => {
    if (!exam) return [];
    return exam.gradingList.flatMap((s, sIdx) =>
      s.questionGroupList.flatMap((gl) =>
        gl.questionGroup.flatMap((sg) =>
          sg.questionList
            .filter((q) => q.type !== QUESTION_TYPE.SOURCE_ONLY)
            .map((q) => ({ ...q, sectionIdx: sIdx })),
        ),
      ),
    );
  }, [exam]);

  const handleScrollToQuestion = (id: string) => {
    const qIdx = allQuestionsFlat.findIndex((q) => q.id === id);
    if (qIdx !== -1) {
      setCurrentQuestionIdx(qIdx);
      const targetSectionIdx = (allQuestionsFlat[qIdx] as any).sectionIdx;

      const scroll = () => {
        const ref = questionRefs.current[id];
        if (ref) {
          ref.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };

      if (targetSectionIdx !== activeTab) {
        setActiveTab(targetSectionIdx);
        setTimeout(scroll, 100);
      } else {
        scroll();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < allQuestionsFlat.length - 1) {
      const nextQ = allQuestionsFlat[currentQuestionIdx + 1];
      handleScrollToQuestion(nextQ.id);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      const prevQ = allQuestionsFlat[currentQuestionIdx - 1];
      handleScrollToQuestion(prevQ.id);
    }
  };

  if (loading || !exam)
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

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
        <Box sx={{ width: "100%", px: 2, py: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Book size={32} variant="Bulk" color="#2563eb" />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Chấm bài: {exam.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Học sinh: {location.state?.studentName || "Học viên"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ width: "100%", px: 2, mt: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
          {/* Main Content Area */}
          <Box sx={{ width: { xs: "100%", lg: "78%" } }}>
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
                    textTransform: "none",
                    fontSize: "1rem",
                    minWidth: 120,
                    color: "text.secondary",
                    pb: 1.5,
                  },
                  "& .Mui-selected": { color: "primary.main" },
                }}
              >
                {exam.gradingList.map((s, idx) => (
                  <Tab key={s.id} label={s.name || `Phần ${idx + 1}`} />
                ))}
              </Tabs>

              <Divider sx={{ mt: -0.125 }} />
            </Box>

            <Stack spacing={4}>
              {exam.gradingList[activeTab].questionGroupList.map(
                (gl, glIdx) => (
                  <Paper
                    key={gl.id}
                    variant="outlined"
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      borderRadius: 3,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "grey.100",
                      transition: "box-shadow 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    {gl.title && (
                      <Box
                        sx={{
                          pb: 3,
                          mb: 4,
                          borderBottom: "1px solid",
                          borderColor: "grey.50",
                        }}
                      >
                        <Stack spacing={2}>
                          {gl.title.filter(hasSource).map((i) => (
                            <SourceItemCard
                              key={i.id}
                              item={i}
                              onPlay={onPlay}
                              onEnd={onEnd}
                              audioRef={currentAudioRef}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Stack spacing={6}>
                      {gl.questionGroup.map((sg, sgIdx) => {
                        const hasSubContent = hasVisibleItems(sg.content);
                        return (
                          <Box key={sg.id}>
                            <Grid container spacing={hasSubContent ? 4 : 0}>
                              {/* Left Side: Content */}
                              {hasSubContent && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Box
                                    sx={{
                                      p: 3,
                                      borderRadius: 3,
                                      bgcolor: "grey.50",
                                      maxHeight: "calc(100vh - 250px)",
                                      overflowY: "auto",
                                      border: "1px solid",
                                      borderColor: "grey.100",
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
                                    <Stack spacing={2.5}>
                                      {sg.content.filter(hasSource).map((i) => (
                                        <SourceItemCard
                                          key={i.id}
                                          item={i}
                                          audioRef={currentAudioRef}
                                          onPlay={onPlay}
                                          onEnd={onEnd}
                                        />
                                      ))}
                                    </Stack>
                                  </Box>
                                </Grid>
                              )}

                              {/* Right Side: Questions */}
                              <Grid
                                size={{ xs: 12, sm: hasSubContent ? 6 : 12 }}
                              >
                                <Box
                                  sx={{
                                    maxHeight: hasSubContent
                                      ? "calc(100vh - 250px)"
                                      : "none",
                                    overflowY: hasSubContent
                                      ? "auto"
                                      : "visible",
                                    pr: hasSubContent ? 1.5 : 0,
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
                                  <Stack spacing={6}>
                                    {sg.questionList.map((q) => (
                                      <GradingQuestionBlock
                                        key={q.id}
                                        question={q}
                                        setRef={(el) =>
                                          (questionRefs.current[q.id] = el)
                                        }
                                        isGradingMode={!isAllGradingDone}
                                        reviewValue={
                                          questionReviews[q.id]?.content ?? ""
                                        }
                                        isCorrect={
                                          questionReviews[q.id]?.isCorrect ??
                                          false
                                        }
                                        onReviewChange={(val) =>
                                          handleReviewUpdate(q.id, {
                                            content: val,
                                          })
                                        }
                                        onCorrectToggle={() =>
                                          handleReviewUpdate(q.id, {
                                            isCorrect: !(
                                              questionReviews[q.id]
                                                ?.isCorrect ?? false
                                            ),
                                          })
                                        }
                                        isAllGradingDone={isAllGradingDone}
                                        audioRef={currentAudioRef}
                                        onPlay={onPlay}
                                        onEnd={onEnd}
                                        activeQuestionId={
                                          allQuestionsFlat[currentQuestionIdx]
                                            ?.id
                                        }
                                      />
                                    ))}
                                  </Stack>
                                </Box>
                              </Grid>
                            </Grid>
                            {sgIdx < gl.questionGroup.length - 1 && (
                              <Divider sx={{ mt: 6, borderStyle: "dashed" }} />
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                ),
              )}
            </Stack>
          </Box>

          {/* Right Sidebar: Controls & Navigator */}
          <Box sx={{ width: { xs: "100%", lg: "22%" } }}>
            <Stack
              sx={{
                position: { lg: "sticky" },
                top: 110,
                width: "100%",
                gap: 2.5,
              }}
            >
              {/* Grading Actions */}
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 3, bgcolor: "white" }}
              >
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="inherit"
                    onClick={() =>
                      navigate(
                        `/exams`,
                        {
                          state: {
                            tabIndex: 3,
                          },
                        },
                      )
                    }
                    startIcon={<ArrowLeft2 size={18} />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      borderColor: "grey.200",
                    }}
                  >
                    Trở về
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="secondary"
                    onClick={copyExamToText}
                    startIcon={<Copy size={18} />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      borderColor: "orange",
                      color: "orange",
                      "&:hover": {
                        borderColor: "darkorange",
                        bgcolor: alpha("#ffa500", 0.04),
                      },
                    }}
                  >
                    Copy bài làm
                  </Button>
                  {!isAllGradingDone && (
                    <>
                      <Button
                        variant="outlined"
                        fullWidth
                        color="primary"
                        onClick={() => handleSave(false)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Lưu tạm
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        color="primary"
                        onClick={() => handleSave(true)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 800,
                          py: 1.25,
                          boxShadow: (theme) =>
                            `0 8px 16px -4px ${alpha(
                              theme.palette.primary.main,
                              0.3,
                            )}`,
                        }}
                      >
                        Lưu & Chấm bài
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* Navigation Buttons */}
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 3, bgcolor: "white" }}
              >
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIdx <= 0}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Câu trước
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIdx >= allQuestionsFlat.length - 1}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Câu sau
                  </Button>
                </Stack>
              </Paper>

              {/* Question Navigator */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "white",
                  maxHeight: "40vh",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 5 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "grey.300",
                    borderRadius: 4,
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  DANH SÁCH CÂU HỎI
                </Typography>
                <Stack spacing={3}>
                  {exam.gradingList.map((section, sIdx) => {
                    const sectionQuestions = section.questionGroupList.flatMap(
                      (gl) =>
                        gl.questionGroup.flatMap((sg) =>
                          sg.questionList.filter(
                            (q) => q.type !== QUESTION_TYPE.SOURCE_ONLY,
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
                          {sectionQuestions.map((q) => {
                            const r = questionReviews[q.id];
                            const isGraded = Boolean(r?.content || q.review);
                            const isCorr =
                              r?.isCorrect ??
                              (q.selectedAnswer?.[0] as any)?.isCorrect === 1;
                            const isActive =
                              allQuestionsFlat[currentQuestionIdx]?.id === q.id;

                            return (
                              <Box
                                key={q.id}
                                onClick={() => handleScrollToQuestion(q.id)}
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
                                  bgcolor: isActive
                                    ? "primary.main"
                                    : isGraded
                                      ? isCorr
                                        ? "success.main"
                                        : "error.main"
                                      : "grey.100",
                                  color:
                                    isActive || isGraded
                                      ? "white"
                                      : "text.primary",
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    boxShadow:
                                      "0 4px 12px -2px rgba(0,0,0,0.1)",
                                  },
                                  border: isActive ? "2px solid" : "none",
                                  borderColor: isActive
                                    ? "primary.dark"
                                    : "transparent",
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

              <Stack direction="column" gap={2}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha("#3f51b5", 0.04),
                    border: "1px solid",
                    borderColor: alpha("#3f51b5", 0.12),
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Điểm / Nhận xét chung
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        Điểm tổng kết:
                      </Typography>
                      <Select
                        disabled={isAllGradingDone}
                        renderValue={(value) => (
                          <Typography variant="body1">
                            {value === 1
                              ? "Không đạt"
                              : value === 5
                                ? "Đạt"
                                : "Chọn đánh giá"}
                          </Typography>
                        )}
                        onChange={(event) =>
                          setExamScore(event.target.value as number)
                        }
                        sx={{ backgroundColor: "white", minWidth: "100%" }}
                        value={examScore || 0}
                      >
                        <MenuItem value={0}>Chọn đánh giá</MenuItem>
                        <MenuItem value={1}>Không đạt (1)</MenuItem>
                        <MenuItem value={5}>Đạt (5)</MenuItem>
                      </Select>
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        Nhận xét chung:
                      </Typography>
                      {isAllGradingDone ? (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2.5, borderRadius: 2, bgcolor: "white" }}
                        >
                          <TiptapReadOnly value={examReview} />
                        </Paper>
                      ) : (
                        <RichTextEditor
                          key="total-review"
                          value={examReview}
                          placeholder="Nhập nhận xét chung... "
                          onChange={(content) => setExamReview(content)}
                        />
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          severity={alert.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
