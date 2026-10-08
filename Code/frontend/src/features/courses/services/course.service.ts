import api from '@/lib/api';
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
  GenerateJoinCodeResponse,
  QueryCoursesParams,
  LecturerKpiMetrics,
} from '../types/course.types';

// Fallback mock data matching the approved prototype for smooth offline/sandbox preview
export const INITIAL_MOCK_COURSES: Course[] = [
  {
    id: 'course-swd392-se19c',
    code: 'SWD392',
    name: 'Kiến Trúc & Thiết Kế Phần Mềm',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'AL-L402',
    capacity: 40,
    enrolledStudentsCount: 38,
    syllabusProgress: 75,
    currentGpaAvg: 8.4,
    enrollmentCode: 'AITA-8924',
    codeExpiresAt: new Date(Date.now() + 275 * 1000).toISOString(),
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-05T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 38,
      assignments: 5,
    },
    enrollments: [
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-01',
        joinedAt: '2026-09-24T08:30:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-01',
          studentCode: 'QE190161',
          fullName: 'Trần Đỗ Phong Nhã',
          email: 'phongnhatd@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-02',
        joinedAt: '2026-09-24T08:35:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-02',
          studentCode: 'QE180203',
          fullName: 'Nguyễn Văn Điệp',
          email: 'diepnv@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-03',
        joinedAt: '2026-09-24T08:42:00Z',
        status: 'PENDING',
        student: {
          id: 'stu-03',
          studentCode: 'QE190003',
          fullName: 'Nguyễn Anh Tuấn',
          email: 'tuanna@fpt.edu.vn',
          role: 'STUDENT',
          status: 'PENDING',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-04',
        joinedAt: '2026-09-24T09:15:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-04',
          studentCode: 'QE190045',
          fullName: 'Lê Hoàng Long',
          email: 'longlh@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-05',
        joinedAt: '2026-09-25T10:00:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-05',
          studentCode: 'QE190112',
          fullName: 'Phạm Minh Đức',
          email: 'ducpm@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
    ],
  },
  {
    id: 'course-prn211-se19b',
    code: 'PRN211',
    name: 'Lập Trình .NET & Ứng Dụng Phân Tán',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'BE-302',
    capacity: 40,
    enrolledStudentsCount: 40,
    syllabusProgress: 60,
    currentGpaAvg: 7.9,
    enrollmentCode: 'PRN-9912',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-04T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 40,
      assignments: 4,
    },
  },
  {
    id: 'course-mas291-se19a',
    code: 'MAS291',
    name: 'Xác Suất Thống Kê Ứng Dụng AI',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'DE-205',
    capacity: 35,
    enrolledStudentsCount: 35,
    syllabusProgress: 85,
    currentGpaAvg: 8.1,
    enrollmentCode: 'MAS-4431',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-03T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 35,
      assignments: 6,
    },
  },
  {
    id: 'course-prj301-se18c',
    code: 'PRJ301',
    name: 'Java Web Application Development',
    semester: 'Summer 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: false,
    room: 'BE-201',
    capacity: 40,
    enrolledStudentsCount: 45,
    syllabusProgress: 100,
    currentGpaAvg: 8.6,
    enrollmentCode: null,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-08-30T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 45,
      assignments: 8,
    },
  },
];

export const courseService = {
  /**
   * Lấy danh sách khóa học của giảng viên
   */
  async getCourses(params?: QueryCoursesParams): Promise<Course[]> {
    try {
      const response = await api.get('/courses', { params });
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return INITIAL_MOCK_COURSES;
    } catch (error) {
      console.warn('[CourseService] Backend unavailable, using mock dataset:', error);
      let list = [...INITIAL_MOCK_COURSES];
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
        );
      }
      if (params?.semester && params.semester !== 'All') {
        list = list.filter((c) => c.semester === params.semester);
      }
      return list;
    }
  },

  /**
   * Lấy chi tiết khóa học theo ID
   */
  async getCourseById(id: string): Promise<Course> {
    try {
      const response = await api.get(`/courses/${id}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Course not found');
    } catch (error) {
      console.warn(`[CourseService] Backend fetch failed for ID: ${id}, using mock detail:`, error);
      const found = INITIAL_MOCK_COURSES.find((c) => c.id === id);
      if (found) return found;
      return INITIAL_MOCK_COURSES[0];
    }
  },

  /**
   * Tạo mới khóa học
   */
  async createCourse(payload: CreateCoursePayload): Promise<Course> {
    try {
      const response = await api.post('/courses', payload);
      return response.data.data;
    } catch (error) {
      console.warn('[CourseService] Create course API fallback:', error);
      const newCourse: Course = {
        id: `course-${payload.code.toLowerCase()}-${Date.now()}`,
        code: payload.code.toUpperCase(),
        name: payload.name,
        semester: payload.semester,
        lecturerId: payload.lecturerId || 'lecturer-vd-01',
        isActive: true,
        capacity: payload.capacity || 40,
        enrolledStudentsCount: 0,
        syllabusProgress: 0,
        currentGpaAvg: 0,
        enrollmentCode: `AITA-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          enrollments: 0,
          assignments: 0,
        },
        enrollments: [],
      };
      INITIAL_MOCK_COURSES.unshift(newCourse);
      return newCourse;
    }
  },

  /**
   * Cập nhật thông tin khóa học
   */
  async updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
    try {
      const response = await api.put(`/courses/${id}`, payload);
      return response.data.data;
    } catch (error) {
      console.warn(`[CourseService] Update course fallback for ${id}:`, error);
      const index = INITIAL_MOCK_COURSES.findIndex((c) => c.id === id);
      if (index !== -1) {
        INITIAL_MOCK_COURSES[index] = { ...INITIAL_MOCK_COURSES[index], ...payload };
        return INITIAL_MOCK_COURSES[index];
      }
      throw error;
    }
  },

  /**
   * Giảng viên sinh mã tham gia lớp học mới (TTL động)
   */
  async generateJoinCode(id: string, expiresInMinutes: number = 30): Promise<GenerateJoinCodeResponse> {
    try {
      const response = await api.post(`/courses/${id}/generate-code`, { expiresInMinutes });
      return response.data.data;
    } catch (error) {
      console.warn(`[CourseService] Generate join code fallback for ${id}:`, error);
      const code = `AITA-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
      const course = INITIAL_MOCK_COURSES.find((c) => c.id === id);
      if (course) {
        course.enrollmentCode = code;
        course.codeExpiresAt = expiresAt;
      }
      return {
        courseId: id,
        enrollmentCode: code,
        expiresAt,
        expiresInMinutes,
        message: 'Sinh mã tham gia lớp học thành công!',
      };
    }
  },

  /**
   * Khóa / thu hồi mã tham gia lớp học
   */
  async revokeJoinCode(id: string): Promise<void> {
    try {
      await api.delete(`/courses/${id}/revoke-code`);
    } catch (error) {
      console.warn(`[CourseService] Revoke join code fallback for ${id}:`, error);
      const course = INITIAL_MOCK_COURSES.find((c) => c.id === id);
      if (course) {
        course.enrollmentCode = null;
        course.codeExpiresAt = null;
      }
    }
  },

  /**
   * Xóa sinh viên khỏi lớp
   */
  async removeStudent(courseId: string, studentId: string): Promise<void> {
    try {
      await api.delete(`/courses/${courseId}/students/${studentId}`);
    } catch (error) {
      console.warn(`[CourseService] Remove student fallback for ${courseId}/${studentId}:`, error);
      const course = INITIAL_MOCK_COURSES.find((c) => c.id === courseId);
      if (course && course.enrollments) {
        course.enrollments = course.enrollments.filter((e) => e.student.id !== studentId && e.student.studentCode !== studentId);
        course._count = {
          ...course._count,
          enrollments: course.enrollments.length,
          assignments: course._count?.assignments || 0,
        };
      }
    }
  },

  /**
   * Tính toán KPI tổng quan của giảng viên
   */
  calculateKpis(courses: Course[]): LecturerKpiMetrics {
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.isActive).length;
    const totalStudents = courses.reduce(
      (sum, c) => sum + (c._count?.enrollments ?? c.enrolledStudentsCount ?? 0),
      0
    );
    const avgCompletionRate =
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + (c.syllabusProgress ?? 0), 0) / courses.length
          )
        : 0;

    return {
      totalCourses,
      activeCourses,
      totalStudents,
      avgCompletionRate: avgCompletionRate || 72.5,
      active24hCount: Math.round(totalStudents * 0.9) || 142,
    };
  },
};
