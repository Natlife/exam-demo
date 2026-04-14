import { useState, useRef, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  CloseCircle,
  ArrowLeft2,
  ArrowRight2,
  Book,
  Timer1,
} from "iconsax-reactjs";

import useAuth from "@/hooks/useAuth";
import { getPreviewById } from "@/api/exam";
import { type ExamSetupRequest } from "@/types/assignment";
import { QUESTION_TYPE, type QuestionRequest } from "@/types/question";
import { TaskBlock } from "./detail";

const hasSource = (item?: any) => Boolean(item?.source?.trim());

const isAnswerFilled = (question: QuestionRequest) => {
  if (question.type === QUESTION_TYPE.SOURCE_ONLY) return true;
  const selected = question.selectedAnswer ?? [];
  if (question.type === QUESTION_TYPE.MCQ) return selected.length > 0;
  return selected.some((answer) => (answer.content ?? []).some(hasSource));
};

const formatTime = (totalSeconds: number) => {
  if (totalSeconds < 0 || Number.isNaN(totalSeconds)) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

interface PreviewProps {
  id?: number | string;
  open: boolean;
  onClose: () => void;
  examData?: ExamSetupRequest;
  onConfirm?: (exam: ExamSetupRequest) => void;
}

export default function DetailPreview({
  id,
  open,
  onClose,
  examData,
  onConfirm,
}: PreviewProps) {
  const intl = useIntl();

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [exam, setExam] = useState<ExamSetupRequest>({
    id: 0,
    name: "",
    total: 0,
    duration: 0,
    sessionId: 0,
    totalPlay: 0,
    sectionList: [],
  });

  const [activeTab, setActiveTab] = useState(0);
  const [timeValue, setTimeValue] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

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

  const dialogContentRef = useRef<HTMLDivElement | null>(null);
  const questionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const setQuestionRef = (el: HTMLElement | null, qId: string) => {
    questionRefs.current[qId] = el;
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

  const handleScrollToQuestion = (qId: string, sectionIdx: number) => {
    setActiveTab(sectionIdx);
    setTimeout(() => {
      const ref = questionRefs.current[qId];
      if (!ref || !dialogContentRef.current) return;

      const container = dialogContentRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = ref.getBoundingClientRect().top;
      const offset = 120;

      container.scrollTo({
        top: container.scrollTop + (elementTop - containerTop) - offset,
        behavior: "smooth",
      });
    }, 50);
  };

  const allQuestionsFlat = useMemo(() => {
    const list: (QuestionRequest & { sectionIdx: number })[] = [];
    (exam.sectionList ?? []).forEach((section, sIdx) => {
      (section.questionGroupList ?? []).forEach((group) => {
        (group.questionGroup ?? []).forEach((subGroup) => {
          (subGroup.questionList ?? []).forEach((q) => {
            if (q.type !== QUESTION_TYPE.SOURCE_ONLY) {
              list.push({ ...q, sectionIdx: sIdx });
            }
          });
        });
      });
    });
    return list;
  }, [exam]);

  useEffect(() => {
    const fetchExam = async () => {
      if (examData) {
        setExam(examData);
        setIsSuccess(true);
        return;
      }
      
      if (!id || !open) return;
      const response = await getPreviewById(id);

      if (response.statusCode === HttpStatusCode.Ok) {
        console.log(response.data);
        setExam(response.data);
        setIsSuccess(true);
      } else {
        setIsSuccess(false);
        setIsError(true);
        setAlert({
          open: true,
          message: intl.formatMessage({ id: "unknown-error" }),
          severity: "error",
        });
      }
    };

    fetchExam();
  }, [id, open, intl]);

  useEffect(() => {
    setTimeValue(exam.duration > 0 ? exam.duration : 0);
  }, [exam.duration]);

  const handleCloseDialog = () => {
    setExam({
      id: 0,
      name: "",
      total: 0,
      duration: 0,
      sessionId: 0,
      totalPlay: 0,
      sectionList: [],
    });
    onClose();
  };

  if (!isSuccess && isError) {
    return (
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogContent>
          <Typography color="error">
            Bài thi này hiện không khả dụng hoặc bạn không có quyền truy cập.
            Vui lòng thử lại sau!
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isSuccess) {
    return (
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogContent sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  const currentSection = exam.sectionList[activeTab];

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={open}
      onClose={handleCloseDialog}
      scroll="paper"
    >
      <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1100 }}>
        <IconButton onClick={handleCloseDialog} color="inherit">
          <CloseCircle size={28} />
        </IconButton>
      </Box>

      <DialogContent ref={dialogContentRef} sx={{ p: 0, bgcolor: "grey.50" }}>
        <Paper
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "grey.100",
            bgcolor: "white",
            px: 4,
            py: 2.5,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
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
                  sx={{ color: "text.secondary", fontWeight: 600 }}
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
        </Paper>

        <Box sx={{ width: "100%", px: { xs: 2, md: 2 }, py: 4 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={3}
            sx={{ width: "100%" }}
          >
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
                    currentAudioRef={currentAudioRef}
                    onPlay={onPlay}
                    onEnd={onEnd}
                    exam={exam}
                    isPreview={true}
                  />
                ))}
              </Box>
            </Box>

            {/* Sidebar Navigator */}
            <Box sx={{ width: { xs: "100%", lg: "15%" } }}>
              <Stack
                sx={{
                  position: { lg: "sticky" },
                  top: 0,
                  width: "100%",
                  gap: 2.5,
                }}
              >
                {exam.duration > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, md: 2 },
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
                        bgcolor:
                          timeValue < 300 ? "error.main" : "primary.main",
                        display: "flex",
                      }}
                    >
                      <Timer1 size={24} color="#FFF" variant="Bulk" />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Thời gian còn lại
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color:
                            timeValue < 300 ? "error.main" : "primary.main",
                          minWidth: 140,
                          fontFamily: "monospace",
                        }}
                      >
                        {formatTime(timeValue)}
                      </Typography>
                    </Box>
                  </Paper>
                )}

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
                    {exam.sectionList.map((section, sIdx) => {
                      const sectionQuestions = (
                        section.questionGroupList ?? []
                      ).flatMap((group) =>
                        (group.questionGroup ?? []).flatMap((sub) =>
                          (sub.questionList ?? []).filter(
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
                              const isFilled = isAnswerFilled(q);
                              // Tìm absolute index để sync với Next/Prev
                              const absIdx = allQuestionsFlat.findIndex(
                                (item) => item.id === q.id,
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
                                    borderColor: isFilled
                                      ? "#C3DAFE"
                                      : "#E2E8F0",
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
                <Stack spacing={1} sx={{ mt: 2.5 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
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
                    disabled
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 800,
                      boxShadow: (theme: any) =>
                        `0 10px 15px -3px ${alpha(
                          theme.palette.primary.main,
                          0.25,
                        )}`,
                    }}
                  >
                    Nộp bài
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
        
        {onConfirm && (
          <Paper
            elevation={10}
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              bgcolor: "grey.100",
              borderTop: "1px solid",
              borderColor: "divider",
              position: "sticky",
              bottom: 0,
              zIndex: 1100,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseDialog}
              sx={{ px: 4, fontWeight: "bold" }}
            >
              Hủy bỏ (Không lưu)
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onConfirm(exam)}
              sx={{ px: 4, fontWeight: "bold" }}
            >
              Xác nhận và Gộp dữ liệu
            </Button>
          </Paper>
        )}
      </DialogContent>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
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
    </Dialog>
  );
}
