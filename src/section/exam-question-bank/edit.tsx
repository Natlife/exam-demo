import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router";

import {
  QUESTION_TYPE,
  QuestionGroupListRequest,
  QuestionRequest,
  sourceRequest,
} from "@/types/question";
import { useIntl } from "react-intl";
import useAuth from "@/hooks/useAuth";
import * as Yup from "yup";
import { HttpStatusCode } from "axios";

import { create as uploadFile } from "@/api/file";
import { updateQuestion as updateQuestionExamApi } from "@/api/exam";
import { ConfirmDialog } from "@/components/ConfirmPopup";
import { useSourceListHandlers } from "@/hooks/useSourceListHandlers";
import { QuestionGroupListSchema } from "@/utils/schemas";
import {
  createQuestion,
  createQuestionGroup,
  createQuestionGroupList,
} from "@/utils/QuestionFactory";
import { TaskBlock } from "../exam/components/QuestionGroup";
import { PreviewModal } from "../exam/components/PreviewModal";

interface UseQuestionSubmitOptions {
  aId: number | string;
  tasks: QuestionGroupListRequest;
  tabValue?: string | number;
  returnPath: string;
  setTasks: React.Dispatch<React.SetStateAction<QuestionGroupListRequest>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setAlert: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "error" | "info" | "warning";
    }>
  >;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

const buildPayload = (
  tasks: QuestionGroupListRequest,
): QuestionGroupListRequest => {
  const hasContent = (content: sourceRequest[]) =>
    content.some((item) => item.source.trim() || item.subContent?.trim());

  return {
    ...tasks,
    questionGroup: tasks.questionGroup.map((group) => ({
      ...group,
      questionList: group.questionList
        .filter((q) => {
          if (q.type === QUESTION_TYPE.MCQ) {
            return q.answerList.some((a) => hasContent(a.content));
          }
          if (q.type === QUESTION_TYPE.FILL) {
            return q.answerList.some(
              (a) => a.isCorrect === 1 && hasContent(a.content),
            );
          }
          if (q.type === QUESTION_TYPE.SOURCE_ONLY) {
            return hasContent(q.content);
          }
          if (q.type === QUESTION_TYPE.ESSAY) {
            return true;
          }
          return true;
        })
        .map((q) => ({
          ...q,
          answerList: q.answerList.filter((a) => hasContent(a.content)),
        })),
    })),
  };
};

export function useQuestionSubmit({
  aId,
  tasks,
  tabValue,
  returnPath,
  setTasks,
  setErrors,
  setAlert,
}: UseQuestionSubmitOptions) {
  const intl = useIntl();
  const navigate = useNavigate();

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      await QuestionGroupListSchema.validate(tasks, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  }, [tasks, setErrors]);

  const handleApiResponse = useCallback(
    (statusCode: number, message: string, onSuccess: () => void) => {
      switch (statusCode) {
        case HttpStatusCode.Ok:
          onSuccess();
          break;
        case HttpStatusCode.Unauthorized:
          break;
        case HttpStatusCode.UnprocessableEntity:
          setAlert({ open: true, message, severity: "error" });
          break;
        default:
          setAlert({
            open: true,
            message: intl.formatMessage({ id: "unknown-error" }),
            severity: "error",
          });
      }
    },
    [intl, setAlert],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!(await validate())) {
        setAlert({
          open: true,
          message: "Dữ liệu không hợp lệ",
          severity: "error",
        });
        return;
      }

      const response = await updateQuestionExamApi(
        aId.toString(),
        buildPayload(tasks),
      );

      handleApiResponse(response.statusCode, response.message, () => {
        navigate(returnPath, {
          state: {
            alert: {
              open: true,
              message: "Lưu câu hỏi thành công",
              severity: "success",
            },
            tabValue: tabValue ?? "2",
          },
        });
      });
    },
    [
      validate,
      aId,
      tasks,
      handleApiResponse,
      navigate,
      returnPath,
      tabValue,
      setAlert,
    ],
  );

  const handleGetFileUrl = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
      const file = e.target.files?.[0];
      if (!file) return null;

      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadFile(formData);

      if (response.statusCode === HttpStatusCode.Ok)
        return response.data.url ?? null;
      else
        setAlert({
          open: true,
          message: intl.formatMessage({ id: "unknown-error" }),
          severity: "error",
        });
      return null;
    },
    [intl, setAlert],
  );

  return { validate, handleSubmit, handleGetFileUrl };
}

export default function EditQuestionBank() {
  const location = useLocation();
  const navigate = useNavigate();

  const { tabValue, aId, group, returnPath } = location.state as {
    tabValue?: string | number;
    aId: number | string;
    group: QuestionGroupListRequest;
    returnPath: string;
  };

  const [tasks, setTasks] = useState<QuestionGroupListRequest>(() =>
    createQuestionGroupList(QUESTION_TYPE.MCQ, 1),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openPreview, setOpenPreview] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success",
  });

  const { handleSubmit, handleGetFileUrl } = useQuestionSubmit({
    aId,
    tasks,
    tabValue,
    returnPath,
    setTasks,
    setErrors,
    setAlert,
  });

  const titleHandlers = useSourceListHandlers("title", setTasks);
  const getContentHandlers = useCallback(
    (groupIndex: number) => ({
      update: (id: string, field: keyof sourceRequest, value: string) => {
        setTasks((prev) => {
          const newGroups = [...prev.questionGroup];
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            content: newGroups[groupIndex].content.map((c) =>
              c.id === id ? { ...c, [field]: value } : c,
            ),
          };
          return { ...prev, questionGroup: newGroups };
        });
      },
      remove: (id: string) => {
        setTasks((prev) => {
          const newGroups = [...prev.questionGroup];
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            content: newGroups[groupIndex].content.filter((c) => c.id !== id),
          };
          return { ...prev, questionGroup: newGroups };
        });
      },
      add: (type: number) => {
        setTasks((prev) => {
          const newGroups = [...prev.questionGroup];
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            content: [
              ...newGroups[groupIndex].content,
              { id: `${Date.now()}`, type, source: "", subContent: "" },
            ],
          };
          return { ...prev, questionGroup: newGroups };
        });
      },
      reorder: (startIndex: number, endIndex: number) => {
        setTasks((prev) => {
          const newGroups = [...prev.questionGroup];
          const newContent = [...newGroups[groupIndex].content];
          const [removed] = newContent.splice(startIndex, 1);
          newContent.splice(endIndex, 0, removed);
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            content: newContent,
          };
          return { ...prev, questionGroup: newGroups };
        });
      },
    }),
    [],
  );

  const handleSaveQuestion = useCallback(
    (groupIndex: number, question: QuestionRequest) => {
      setTasks((prev) => {
        const newGroups = [...prev.questionGroup];
        newGroups[groupIndex] = {
          ...newGroups[groupIndex],
          questionList: newGroups[groupIndex].questionList.map((q) =>
            q.id === question.id ? question : q,
          ),
        };
        return { ...prev, questionGroup: newGroups };
      });
    },
    [],
  );

  const handleAddQuestion = useCallback((groupIndex: number) => {
    setTasks((prev) => {
      const newGroups = [...prev.questionGroup];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        questionList: [
          ...newGroups[groupIndex].questionList,
          createQuestion(
            QUESTION_TYPE.MCQ,
            newGroups[groupIndex].questionList.length + 1,
          ),
        ],
      };
      return { ...prev, questionGroup: newGroups };
    });
  }, []);

  const [openDeleteQuestion, setOpenDeleteQuestion] = useState(false);
  const [openDeleteGroup, setOpenDeleteGroup] = useState(false);
  const [openBackConfirm, setOpenBackConfirm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    groupIndex: number;
    question: QuestionRequest;
  } | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null,
  );

  const handleRequestDeleteQuestion = useCallback(
    (groupIndex: number, question: QuestionRequest) => {
      setSelectedQuestion({ groupIndex, question });
      setOpenDeleteQuestion(true);
    },
    [],
  );

  const handleConfirmDelete = () => {
    if (selectedQuestion) {
      setTasks((prev) => {
        const newGroups = [...prev.questionGroup];
        newGroups[selectedQuestion.groupIndex] = {
          ...newGroups[selectedQuestion.groupIndex],
          questionList: newGroups[
            selectedQuestion.groupIndex
          ].questionList.filter((q) => q.id !== selectedQuestion.question.id),
        };
        return { ...prev, questionGroup: newGroups };
      });
    }

    setOpenDeleteQuestion(false);
    setSelectedQuestion(null);
  };

  const handleRequestDeleteGroup = useCallback((groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setOpenDeleteGroup(true);
  }, []);

  const handleConfirmDeleteGroup = () => {
    if (selectedGroupIndex !== null) {
      setTasks((prev) => ({
        ...prev,
        questionGroup: prev.questionGroup.filter(
          (_, i) => i !== selectedGroupIndex,
        ),
      }));
    }

    setOpenDeleteGroup(false);
    setSelectedGroupIndex(null);
  };

  const handleSerialNumberChange = useCallback((value: number) => {
    setTasks((prev) => ({ ...prev, serialNumber: value }));
  }, []);

  const handleFormatSerialNumbers = useCallback((groupIndex: number) => {
    setTasks((prev) => {
      const newGroups = [...prev.questionGroup];
      let currentSerial = 1;
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        questionList: newGroups[groupIndex].questionList.map((q) => {
          if (q.type === QUESTION_TYPE.SOURCE_ONLY) return q;
          return { ...q, serialNumber: currentSerial++ };
        }),
      };
      return { ...prev, questionGroup: newGroups };
    });
  }, []);

  const handleRemoveGroup = useCallback(
    (groupIndex: number) => {
      handleRequestDeleteGroup(groupIndex);
    },
    [handleRequestDeleteGroup],
  );

  const handleAddGroup = useCallback(() => {
    setTasks((prev) => ({
      ...prev,
      questionGroup: [
        ...prev.questionGroup,
        createQuestionGroup(QUESTION_TYPE.MCQ, prev.questionGroup.length + 1),
      ],
    }));
  }, []);

  useEffect(() => {
    const fetchData = () => {
      if (group) {
        setTasks(group);
      }
    };

    fetchData();
  }, [group, setOpenPreview]);

  return (
    <Box sx={{ width: "100%", p: 5 }}>
      <form onSubmit={handleSubmit} noValidate>
        <ConfirmDialog
          open={openDeleteQuestion}
          onClose={() => setOpenDeleteQuestion(false)}
          title="Xác nhận xoá câu hỏi"
          description="Bạn có chắc chắn muốn xoá câu hỏi này?"
          onConfirm={handleConfirmDelete}
        />

        <ConfirmDialog
          open={openDeleteGroup}
          onClose={() => setOpenDeleteGroup(false)}
          title="Xác nhận xoá nhóm câu hỏi"
          description="Bạn có chắc chắn muốn xoá toàn bộ nhóm câu hỏi này không?"
          onConfirm={handleConfirmDeleteGroup}
        />

        <ConfirmDialog
          open={openBackConfirm}
          onClose={() => setOpenBackConfirm(false)}
          title="Xác nhận quay lại"
          description="Dữ liệu đang nhập sẽ không được lưu. Bạn có chắc chắn muốn quay lại không?"
          onConfirm={() =>
            navigate(returnPath, { state: { tabValue: tabValue ?? 3 } })
          }
        />

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h4">Chỉnh sửa câu hỏi phần thi</Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            mx: { xs: 0, lg: 10 },
          }}
        >
          <TaskBlock
            questionGroupList={tasks}
            questionType={QUESTION_TYPE.MCQ}
            onSaveQuestion={handleSaveQuestion}
            onGetFile={handleGetFileUrl}
            onAddQuestion={handleAddQuestion}
            onSerialNumberChange={handleSerialNumberChange}
            errors={errors}
            titleHandlers={titleHandlers}
            getContentHandlers={getContentHandlers}
            onRequestDeleteQuestion={handleRequestDeleteQuestion}
            onAddGroup={handleAddGroup}
            onRequestDeleteGroup={handleRemoveGroup}
            onFormatSerialNumbers={handleFormatSerialNumbers}
            isExam={true}
          />

          <Snackbar
            open={alert.open}
            autoHideDuration={3000}
            onClose={() => setAlert((a) => ({ ...a, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              severity={alert.severity}
              variant="filled"
              sx={{ width: "100%", borderRadius: 2 }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Paper>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ pt: 2, mx: { xs: 0, lg: 10 } }}
        >
          <Button
            variant="outlined"
            sx={{ borderColor: "orangered", color: "orangered" }}
            onClick={() => setOpenBackConfirm(true)}
          >
            Quay lại
          </Button>

          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              color="info"
              onClick={() => setOpenPreview(true)}
            >
              Xem trước
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "orangered" }}
            >
              Xác nhận
            </Button>
          </Stack>
        </Stack>
      </form>

      <PreviewModal
        showPreview={openPreview}
        setShowPreview={setOpenPreview}
        questionGroupList={tasks}
      />
    </Box>
  );
}
