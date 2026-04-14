import {
  ExamGradingReviewRequest,
  GradingReviewRequest,
} from "@/types/assignment";
import { loadExams } from "@/mock/data";
import { GRADING_STATUS } from "@/types/question";

const getStatisticByAssignmentId = async (assignmentId: number) => {
  return {
    statusCode: 200,
    data: {
      mcqCount: 5,
      essayCount: 5,
      total: 10,
      time: 3600,
    },
  };
};

const getGradingAssignment = async (
  classId: number,
  sessionId: number,
  studentId: number,
) => {
  return {
    statusCode: 200,
    data: [],
  };
};

const getGradingExam = async (
  classId: number | string,
  sessionId: number | string,
  examId: number | string,
  studentId: number | string,
) => {
  const exams = loadExams();
  const exam = exams.find((e) => String(e.id) === String(examId)) || exams[0];

  // Load submissions from localStorage (saved in api/exam.ts submit function)
  const submissions = JSON.parse(
    localStorage.getItem("exam_submissions") || "[]",
  );
  // Get latest submission for this exam
  const submission = [...submissions]
    .reverse()
    .find((s) => String(s.examId) === String(examId));

  const answerLog = submission?.data?.answerLog || [];

  if (!exam) {
    return {
      statusCode: 200,
      data: {
        examId,
        examLogId: 1,
        name: "Bài thi Demo",
        time: 0,
        gradingList: [],
        score: 0,
        review: "",
        gradingStatus: GRADING_STATUS.PENDING,
      },
    };
  }

  return {
    statusCode: 200,
    data: {
      examId: exam.id,
      examLogId: 1,
      name: exam.name,
      time: submission?.data?.time || 0,
      gradingList: exam.sectionList.map((section) => {
        // Find matching section in student's answerLog
        const submittedSection = answerLog.find(
          (s: any) => String(s.id) === String(section.id),
        );

        return {
          ...section,
          questionGroupList: (section.questionGroupList || []).map((gl) => {
            const submittedGL = submittedSection?.questionGroupList?.find(
              (sgl: any) => String(sgl.id) === String(gl.id),
            );

            return {
              ...gl,
              questionGroup: (gl.questionGroup || []).map((group) => {
                const submittedGroup = submittedGL?.questionGroup?.find(
                  (sg: any) => String(sg.id) === String(group.id),
                );

                return {
                  ...group,
                  questionList: (group.questionList || []).map((q) => {
                    const submittedQ = submittedGroup?.questionList?.find(
                      (sq: any) => String(sq.id) === String(q.id),
                    );

                    return {
                      ...q,
                      selectedAnswer: submittedQ?.selectedAnswer || [],
                      review: submittedQ?.review || "",
                    };
                  }),
                };
              }),
            };
          }),
        };
      }),
      score: 0,
      review: "",
      gradingStatus: GRADING_STATUS.PENDING,
    },
  };
};

const updateGradingAssignment = async (
  classId: number,
  sessionId: number,
  studentId: number,
  gradingReviews: GradingReviewRequest[],
) => {
  return { statusCode: 200, message: "Updated" };
};

const updateGradingExam = async (
  classId: number,
  sessionId: number,
  studentId: number,
  gradingReview: ExamGradingReviewRequest,
) => {
  return { statusCode: 200, message: "Updated" };
};

const submitGradingAssignment = async (
  classId: number,
  sessionId: number,
  studentId: number,
  gradingReviews: GradingReviewRequest[],
) => {
  return { statusCode: 200, message: "Submitted" };
};

const submitGradingExam = async (
  classId: number,
  sessionId: number,
  studentId: number,
  gradingReview: ExamGradingReviewRequest,
) => {
  return { statusCode: 200, message: "Submitted" };
};

export {
  getStatisticByAssignmentId,
  getGradingAssignment,
  updateGradingAssignment,
  updateGradingExam,
  getGradingExam,
  submitGradingAssignment,
  submitGradingExam,
};
