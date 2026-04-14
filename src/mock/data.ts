import { ExamSetupRequest } from '../types/assignment';

const STORAGE_KEY = 'exam_data';

export const loadExams = (): ExamSetupRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Initial mock data if empty
    const initialExams: ExamSetupRequest[] = [
      {
        id: '1',
        name: 'Mock Exam 1',
        total: 10,
        duration: 60,
        sessionId: 101,
        totalPlay: 0,
        sectionList: [
          {
            id: 's1',
            name: 'Section 1',
            questionGroupList: []
          }
        ]
      }
    ];
    saveExams(initialExams);
    return initialExams;
  }
  return JSON.parse(data);
};

export const saveExams = (exams: ExamSetupRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
};

export const initStorage = () => {
  loadExams();
};

