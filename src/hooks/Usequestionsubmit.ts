import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { HttpStatusCode } from 'axios';
import * as Yup from 'yup';

import { QuestionGroupListRequest, sourceRequest } from '@/types/question';
import { createQuestion } from '@/api/exam';
import { create as uploadFile } from '@/api/file';
import useAuth from '@/hooks/useAuth';
import { QuestionGroupListSchema } from '@/utils/schemas';
import { createQuestionGroupList } from '@/utils/QuestionFactory';

interface UseQuestionSubmitOptions {
  aId: number;
  tasks: QuestionGroupListRequest;
  questionType: number;
  assignmentType: number | string;
  returnPath: string;
  session: unknown;
  classes: unknown;
  sessionIndex: unknown;
  setTasks: React.Dispatch<React.SetStateAction<QuestionGroupListRequest>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setAlert: React.Dispatch<React.SetStateAction<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>>;
}

const buildPayload = (tasks: QuestionGroupListRequest): QuestionGroupListRequest => ({
  ...tasks,
  title: tasks.title.filter((t) => t.source.trim()),
  questionGroup: tasks.questionGroup.map((group) => ({
    ...group,
    content: group.content.filter((c) => c.source.trim()),
    questionList: group.questionList
      .filter((q) => q.content.some((item) => item.source.trim()))
      .map((q) => ({
        ...q,
        content: q.content.filter((c) => c.source.trim()),
        answerList: q.answerList.filter((a) => a.content.every((item: sourceRequest) => item.subContent?.trim() || item.source.trim()))
      }))
  }))
});

export function useQuestionSubmit({
  aId,
  tasks,
  questionType,
  assignmentType,
  returnPath,
  session,
  classes,
  sessionIndex,
  setTasks,
  setErrors,
  setAlert
}: UseQuestionSubmitOptions) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ─── Validation ────────────────────────────────────────────────────────────

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

  // ─── API response handler ──────────────────────────────────────────────────

  const handleApiResponse = useCallback(
    (statusCode: number, message: string, onSuccess: () => void) => {
      switch (statusCode) {
        case HttpStatusCode.Ok:
          onSuccess();
          break;
        case HttpStatusCode.Unauthorized:
          logout();
          break;
        case HttpStatusCode.UnprocessableEntity:
          setAlert({ open: true, message, severity: 'error' });
          break;
        default:
          setAlert({ open: true, message: intl.formatMessage({ id: 'unknown-error' }), severity: 'error' });
      }
    },
    [intl, logout, setAlert]
  );

  // ─── Save & new ────────────────────────────────────────────────────────────

  const handleSaveAndNew = useCallback(async () => {
    if (!(await validate())) {
      setAlert({ open: true, message: 'Dữ liệu không hợp lệ', severity: 'error' });
      return;
    }
    const response = await createQuestion(aId, buildPayload(tasks));
    handleApiResponse(response.statusCode, response.message || '', () => {
      setAlert({ open: true, message: 'Lưu câu hỏi thành công', severity: 'success' });
      setTasks(createQuestionGroupList(questionType, tasks.serialNumber + 1));
    });
  }, [validate, aId, tasks, questionType, handleApiResponse, setAlert, setTasks]);

  // ─── Submit & navigate ─────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!(await validate())) {
        setAlert({ open: true, message: 'Dữ liệu không hợp lệ', severity: 'error' });
        return;
      }
      const response = await createQuestion(aId, buildPayload(tasks));
      handleApiResponse(response.statusCode, response.message || '', () => {
        navigate(returnPath, {
          state: {
            alert: { open: true, message: 'Lưu câu hỏi thành công', severity: 'success' },
            tabValue: assignmentType.toString(),
            session,
            classes,
            sessionIndex
          }
        });
      });
    },
    [validate, aId, tasks, handleApiResponse, navigate, returnPath, assignmentType, session, classes, sessionIndex, setAlert]
  );

  // ─── File upload ───────────────────────────────────────────────────────────

  const handleGetFileUrl = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
      const file = e.target.files?.[0];
      if (!file) return null;
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadFile(formData);
      if (response.statusCode === HttpStatusCode.Ok) return response.data.url ?? null;
      if (response.statusCode === HttpStatusCode.Unauthorized) logout();
      else setAlert({ open: true, message: intl.formatMessage({ id: 'unknown-error' }), severity: 'error' });
      return null;
    },
    [intl, logout, setAlert]
  );

  return { validate, handleSaveAndNew, handleSubmit, handleGetFileUrl };
}

