export interface PageResult<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
  };
  totalPages: number;
  totalElements: number;
}

export interface PageRequest {
  size?: number;
  page?: number;
  sort?: string;
  keyword?: string;
  type?: string | undefined;
  status?: string | undefined;
  roleId?: string | undefined;
  studyStatus?: string | undefined;
  paymentStatus?: string | undefined;
  classId?: string | undefined;
  courseId?: string | undefined;
  scheduleId?: string | undefined;
  date?: string | undefined;
  highlightId?: string | undefined;
  onlyPaid?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  workplaceId?: string | undefined;
  teacherName?: string | undefined;
  courseCode?: string | undefined;
  dueDate?: string | undefined;
  ageType?: string | undefined;
  learningType?: string | undefined;
  tabType?: string | undefined;
  sessionOrder?: number | undefined;
  isUpsale?: number | undefined;
  classStatus?: string | undefined;
  month?: number | undefined;
  year?: number | undefined;
  filter?: string | undefined;
  isClassWaiting?: string | undefined;
  attendanceStatus?: string | undefined;
  value?: number | string | undefined;
  hasLeader?: number | undefined;
  teamId?: string | undefined;
  departmentId?: string | undefined;
  classCode?: string | undefined;
  nextCourseCode?: string | undefined;
  advisorId?: number | undefined;
  advisorName?: string | undefined;
  isFromReport?: string | undefined;
}

export const DEFAULT_PAGE_SIZE = 10;
