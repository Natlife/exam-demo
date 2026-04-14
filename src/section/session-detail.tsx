import {
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Box,
  InputLabel,
  TextField,
} from "@mui/material";
import { Grid, Stack } from "@mui/system";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";
import { ExamSetupRequest } from "types/assignment";
import { SectionRequest } from "types/question";
import {
  createExam,
  deleteExam,
  getListBySessionId as getListExamBySesssionId,
  update as updateExam,
} from "../api/exam";
import ExamComponent from "./exam/exam-component";

// --- Mock session data (replaces missing api/session) ---
const MOCK_SESSION = {
  id: 1,
  sessionName: "Buổi học Demo",
  materialUrl: "",
  courseId: 1,
  courseCode: "DEMO001",
  courseName: "Khóa học Demo",
};

export default function DetailSession() {
  const intl = useIntl();
  const navigate = useNavigate();

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [exams, setExams] = useState<ExamSetupRequest[]>([]);
  const session = MOCK_SESSION;

  const getNewSection = (): SectionRequest => ({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: "Phần mới",
    questionGroupList: [],
  });

  const getNewExam = (): ExamSetupRequest => ({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: "Bài tập cuối khóa mới",
    total: 0,
    totalPlay: 0,
    duration: 0,
    sessionId: session.id,
    sectionList: [],
  });

  const fetchExams = useCallback(async () => {
    const response = await getListExamBySesssionId();
    if (response.statusCode === HttpStatusCode.Ok) {
      setExams(response.data as ExamSetupRequest[]);
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  }, [intl]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleOnChangeExam = async (
    id: number | string,
    ex: ExamSetupRequest,
  ) => {
    const updatedExams = exams.map((exam) =>
      String(exam.id) === String(id) ? { ...ex } : exam,
    );
    const response = await updateExam(ex);
    if (response.statusCode === HttpStatusCode.Ok) {
      setExams(updatedExams);
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  };

  const handleAddNewExam = async () => {
    const newExam = getNewExam();
    const response = await createExam(newExam);
    if (response.statusCode === HttpStatusCode.Ok) {
      fetchExams();
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  };

  const handleRemoveExam = async (exam: ExamSetupRequest) => {
    setExams((prev) => prev.filter((a) => a !== exam));
    const response = await deleteExam(exam.id ? exam.id : 0);
    if (response.statusCode === HttpStatusCode.Ok) {
      fetchExams();
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, p: 5 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h3">Cập nhật thông tin buổi học</Typography>
      </Box>

      <form noValidate>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box mb={1}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Thông tin buổi học
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <Stack
                  direction="row"
                  gap={3}
                  sx={{
                    p: 2,
                    backgroundColor: "white",
                    border: "1px solid grey",
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="column">
                    <Typography variant="h5">{session.courseName}</Typography>
                    <Typography variant="h6">
                      Mã khóa: {session.courseCode}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={12}>
                <InputLabel
                  htmlFor="sessionName"
                  required
                  sx={{
                    "& .MuiInputLabel-asterisk": { color: "error.main" },
                    mb: 1,
                  }}
                >
                  Tên buổi học
                </InputLabel>

                <TextField
                  id="sessionName"
                  name="sessionName"
                  placeholder="Nhập tên buổi học"
                  size="small"
                  fullWidth
                  defaultValue={session.sessionName}
                />
              </Grid>

              <Grid size={12}>
                <InputLabel htmlFor="materialUrl" sx={{ mb: 1 }}>
                  Link tài liệu buổi học
                </InputLabel>

                <TextField
                  id="materialUrl"
                  name="materialUrl"
                  placeholder="Nhập link tài liệu buổi học"
                  size="small"
                  fullWidth
                  defaultValue={session.materialUrl}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Thông tin bài tập
          </Typography>

          <Grid
            size={{ xs: 12, md: 12 }}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Stack direction="column" gap={4}>
              <Stack
                direction={"column"}
                sx={{
                  pb: 3,
                  pt: 0,
                  borderRadius: 2,
                  border: "1px solid #d9d6d6",
                  overflow: "hidden",
                }}
                gap={2}
              >
                <Box
                  sx={{
                    backgroundColor: "#EFEFEF",
                    m: 0,
                    p: 2,
                    borderRadiusTop: 2,
                  }}
                >
                  <Typography variant="h4">
                    Danh sách bài tập cuối khóa
                  </Typography>
                </Box>

                <Stack direction="column" gap={2} sx={{ px: 3 }}>
                  {exams.map((exam, index) => (
                    <Stack direction="column" gap={1} key={exam.id}>
                      <ExamComponent
                        courseId={session.courseId}
                        handleDeleteExam={handleRemoveExam}
                        examData={exam}
                        onSave={handleOnChangeExam}
                        onUpdate={(ex) => handleOnChangeExam(ex.id, ex)}
                        index={index}
                        fetchExams={fetchExams}
                        getNewExamQuestionBank={getNewSection}
                        isDone={false}
                        alert={alert}
                        setAlert={(a) => setAlert(a)}
                      />
                    </Stack>
                  ))}

                  <Typography
                    sx={{
                      width: "15%",
                      color: "orangered",
                      fontWeight: "semibold",
                      cursor: "pointer",
                    }}
                    onClick={() => handleAddNewExam()}
                  >
                    Tạo bài tập cuối khóa
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Paper>

        <Grid
          display="flex"
          justifyContent="space-between"
          sx={{ xs: 12, mt: 2 }}
        >
          <Button
            variant="contained"
            sx={{ my: 3 }}
            color="primary"
            onClick={() => navigate("/exams")}
          >
            Quay lại
          </Button>

          <Button
            variant="contained"
            type="submit"
            sx={{ my: 3, ml: 1 }}
            onClick={() =>
              setAlert({
                open: true,
                message: "Cập nhật thông tin thành công",
                severity: "success",
              })
            }
          >
            Cập nhật
          </Button>
        </Grid>
      </form>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
