import { loadExams, saveExams } from "../mock/data";
import { ExamSetupRequest } from "../types/assignment";
import { SectionRequest } from "../types/question";

export const updateSection = async (
  sectionId: number | string,
  updatedData: SectionRequest,
) => {
  const exams = loadExams();
  let found = false;
  const updatedExams = exams.map((exam) => ({
    ...exam,
    sectionList: exam.sectionList.map((sec) => {
      if (String(sec.id) === String(sectionId)) {
        found = true;
        return updatedData;
      }
      return sec;
    }),
  }));

  if (found) {
    saveExams(updatedExams);
    return { statusCode: 200, data: updatedData };
  }
  return { statusCode: 404, message: "Section not found" };
};

export const createSection = async (
  examId: number | string,
  section: SectionRequest,
) => {
  const exams = loadExams();
  let newId = section.id || Date.now();
  const updatedExams = exams.map((exam) => {
    if (String(exam.id) === String(examId)) {
      return {
        ...exam,
        sectionList: [...exam.sectionList, { ...section, id: newId }],
      };
    }
    return exam;
  });

  saveExams(updatedExams);
  return { statusCode: 200, data: newId };
};

export const deleteSection = async (sectionId: number | string) => {
  const exams = loadExams();
  const updatedExams = exams.map((exam) => ({
    ...exam,
    sectionList: exam.sectionList.filter(
      (sec) => String(sec.id) !== String(sectionId),
    ),
  }));

  saveExams(updatedExams);
  return { statusCode: 200 };
};

export const getById = async (id: number | string) => {
  const exams = loadExams();
  const exam = exams.find((e) => String(e.id) === String(id));
  if (exam) {
    return { statusCode: 200, data: exam };
  }
  return { statusCode: 404, message: "Exam not found" };
};

export const save = async (id: number | string, data: any) => {
  const exams = loadExams();
  const updatedExams = exams.map((e) =>
    String(e.id) === String(id) ? { ...e, ...data } : e,
  );
  saveExams(updatedExams);
  return { statusCode: 200, message: "Saved" };
};

export const update = async (exam: ExamSetupRequest) => {
  const exams = loadExams();
  const updatedExams = exams.map((e) =>
    String(e.id) === String(exam.id) ? exam : e,
  );
  saveExams(updatedExams);
  return { statusCode: 200, data: exam, message: "Updated" };
};

export const submit = async (id: number | string, data: any) => {
  try {
    const submissions = JSON.parse(
      localStorage.getItem("exam_submissions") || "[]"
    );
    submissions.push({ examId: id, data, submittedAt: Date.now() });
    
    // Limit submissions to the last 20 to avoid exceeding localStorage quota
    const limitedSubmissions = submissions.slice(-20);
    
    localStorage.setItem("exam_submissions", JSON.stringify(limitedSubmissions));
    return { statusCode: 200, message: "Submitted" };
  } catch (error) {
    console.error("Submission error:", error);
    if (error instanceof Error && error.name === "QuotaExceededError") {
      return { 
        statusCode: 500, 
        message: "Bộ nhớ trình duyệt bị đầy (do dung lượng ảnh quá lớn). Vui lòng thử lại với ảnh nhỏ hơn hoặc xóa bớt dữ liệu." 
      };
    }
    return { statusCode: 500, message: "Lỗi hệ thống khi nộp bài." };
  }
};

export const getPreviewById = async (id: number | string) => {
  return getById(id);
};

export const createQuestion = async (
  sectionId: number | string,
  groupList: any,
) => {
  const exams = loadExams();
  let found = false;
  const updatedExams = exams.map((exam) => ({
    ...exam,
    sectionList: exam.sectionList.map((sec) => {
      if (String(sec.id) === String(sectionId)) {
        found = true;
        return {
          ...sec,
          questionGroupList: [
            ...(sec.questionGroupList || []),
            { ...groupList, id: groupList.id || `gl-${Date.now()}` },
          ],
        };
      }
      return sec;
    }),
  }));

  if (found) {
    saveExams(updatedExams);
    return { statusCode: 200, data: groupList, message: "Created" };
  }
  return { statusCode: 404, message: "Section not found" };
};

export const updateQuestion = async (glId: string, groupList: any) => {
  const exams = loadExams();
  let found = false;
  const updatedExams = exams.map((exam) => ({
    ...exam,
    sectionList: exam.sectionList.map((sec) => ({
      ...sec,
      questionGroupList: (sec.questionGroupList || []).map((gl) => {
        if (String(gl.id) === String(glId)) {
          found = true;
          return groupList;
        }
        return gl;
      }),
    })),
  }));

  if (found) {
    saveExams(updatedExams);
    return { statusCode: 200, data: groupList, message: "Updated" };
  }
  return { statusCode: 404, message: "Question group not found" };
};

export const getAnswerById = async (id: number | string) => {
  return getById(id);
};

export const createExam = async (
  exam: ExamSetupRequest,
  _sessionId?: number,
) => {
  const exams = loadExams();
  const newExam = {
    ...exam,
    id: exam.id || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  };
  saveExams([...exams, newExam]);
  return { statusCode: 200, data: newExam };
};

export const deleteExam = async (id: number | string) => {
  const exams = loadExams();
  saveExams(exams.filter((e) => String(e.id) !== String(id)));
  return { statusCode: 200 };
};

export const getListBySessionId = async (_sessionId?: number) => {
  const exams = loadExams();
  return { statusCode: 200, data: exams };
};
