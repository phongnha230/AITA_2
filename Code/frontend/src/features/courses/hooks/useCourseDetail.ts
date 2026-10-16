import { useState, useEffect, useCallback, useMemo } from 'react';
import { Course, CourseEnrollment } from '../types/course.types';
import { courseService } from '../services/course.service';

interface UseCourseDetailOptions {
  courseId: string;
  initialCourse?: Course;
}

const secondsUntil = (expiresAt?: string | null): number => {
  if (!expiresAt) return 0;
  const expirationTime = new Date(expiresAt).getTime();
  return Number.isFinite(expirationTime) ? Math.max(0, Math.ceil((expirationTime - Date.now()) / 1000)) : 0;
};

export function useCourseDetail({ courseId, initialCourse }: UseCourseDetailOptions) {
  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Join Code states
  const [joinCode, setJoinCode] = useState<string>(initialCourse?.enrollmentCode || '');
  const [secondsLeft, setSecondsLeft] = useState<number>(secondsUntil(initialCourse?.codeExpiresAt));
  const [isEnrollOpen, setIsEnrollOpen] = useState<boolean>(
    Boolean(initialCourse?.enrollmentCode && secondsUntil(initialCourse.codeExpiresAt) > 0)
  );

  // Students filter state
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  // QR Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Fetch course details
  const fetchDetail = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
      const activeCodeSeconds = secondsUntil(data.codeExpiresAt);
      setJoinCode(activeCodeSeconds > 0 ? data.enrollmentCode || '' : '');
      setSecondsLeft(activeCodeSeconds);
      setIsEnrollOpen(Boolean(data.enrollmentCode && activeCodeSeconds > 0));
    } catch (err: any) {
      setError(err?.message || 'Không thể tải chi tiết lớp học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (initialCourse) setCourse(initialCourse);
    void fetchDetail();
  }, [courseId, initialCourse, fetchDetail]);

  // Dynamic Countdown Timer
  useEffect(() => {
    if (!isEnrollOpen || secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
      if (secondsLeft <= 1) {
        setIsEnrollOpen(false);
        setJoinCode('');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isEnrollOpen, secondsLeft]);

  // Formatted timer mm:ss
  const formattedCountdown = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return secondsLeft > 0 ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : 'Đã hết hạn';
  }, [secondsLeft]);

  // Regenerate Join Code
  const regenerateCode = async () => {
    try {
      if (course) {
        const res = await courseService.generateJoinCode(course.id, 5);
        setJoinCode(res.enrollmentCode);
        setSecondsLeft(secondsUntil(res.expiresAt));
        setIsEnrollOpen(true);
        showToast(`Đã tạo mã tham gia ${res.enrollmentCode}.`);
      } else {
        showToast('Không tìm thấy khóa học để tạo mã tham gia.');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo mã tham gia.');
    }
  };

  // Copy Code to Clipboard
  const copyCodeToClipboard = async () => {
    if (!joinCode) {
      showToast('Khóa học chưa có mã tham gia hoạt động.');
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(joinCode);
      }
      showToast(`Đã sao chép mã ${joinCode} vào clipboard!`);
    } catch {
      showToast(`Đã sao chép mã ${joinCode}`);
    }
  };

  // Toggle Enrollment Switch
  const toggleEnrollmentStatus = async () => {
    if (!course) return;
    if (isEnrollOpen) {
      try {
        await courseService.revokeJoinCode(course.id);
        setJoinCode('');
        setSecondsLeft(0);
        setIsEnrollOpen(false);
        showToast('Đã khóa ghi danh và thu hồi mã tham gia.');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Không thể khóa ghi danh.');
      }
    } else {
      try {
        const response = await courseService.generateJoinCode(course.id, 30);
        setJoinCode(response.enrollmentCode);
        setSecondsLeft(secondsUntil(response.expiresAt));
        setIsEnrollOpen(true);
        showToast(`Đã mở ghi danh bằng mã ${response.enrollmentCode}.`);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Không thể mở ghi danh.');
      }
    }
  };

  // Remove Student
  const removeStudent = async (studentId: string, studentName: string) => {
    if (!course) return;
    try {
      await courseService.removeStudent(course.id, studentId);
      setCourse((prev) => {
        if (!prev || !prev.enrollments) return prev;
        const updated = prev.enrollments.filter(
          (e) => e.student.id !== studentId && e.student.studentCode !== studentId
        );
        return {
          ...prev,
          enrollments: updated,
          _count: {
            ...prev._count,
            enrollments: updated.length,
            assignments: prev._count?.assignments || 0,
          },
        };
      });
      showToast(`Đã xóa sinh viên ${studentName} khỏi lớp`);
    } catch (err: any) {
      showToast('Lỗi khi xóa sinh viên');
    }
  };

  // Filtered Students list
  const filteredEnrollments: CourseEnrollment[] = useMemo(() => {
    if (!course || !course.enrollments) return [];

    return course.enrollments.filter((enrollment) => {
      const student = enrollment.student;
      const matchesSearch =
        studentSearch.trim() === '' ||
        student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (student.studentCode && student.studentCode.toLowerCase().includes(studentSearch.toLowerCase()));

      const matchesStatus =
        studentStatusFilter === 'ALL' ||
        (studentStatusFilter === 'VERIFIED' && (enrollment.status === 'VERIFIED' || student.status === 'ACTIVE')) ||
        (studentStatusFilter === 'PENDING' && (enrollment.status === 'PENDING' || student.status === 'PENDING'));

      return matchesSearch && matchesStatus;
    });
  }, [course, studentSearch, studentStatusFilter]);

  return {
    course,
    loading,
    error,
    joinCode,
    secondsLeft,
    formattedCountdown,
    isEnrollOpen,
    isQrModalOpen,
    setIsQrModalOpen,
    studentSearch,
    setStudentSearch,
    studentStatusFilter,
    setStudentStatusFilter,
    filteredEnrollments,
    toastMessage,
    showToast,
    closeToast,
    regenerateCode,
    copyCodeToClipboard,
    toggleEnrollmentStatus,
    removeStudent,
    refreshDetail: fetchDetail,
  };
}
