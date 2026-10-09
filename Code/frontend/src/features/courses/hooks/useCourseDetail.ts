import { useState, useEffect, useCallback, useMemo } from 'react';
import { Course, CourseEnrollment } from '../types/course.types';
import { courseService } from '../services/course.service';

interface UseCourseDetailOptions {
  courseId: string;
  initialCourse?: Course;
}

export function useCourseDetail({ courseId, initialCourse }: UseCourseDetailOptions) {
  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [loading, setLoading] = useState<boolean>(!initialCourse);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Join Code states
  const [joinCode, setJoinCode] = useState<string>(initialCourse?.enrollmentCode || 'AITA-8924');
  const [secondsLeft, setSecondsLeft] = useState<number>(275); // 4m 35s default
  const [isEnrollOpen, setIsEnrollOpen] = useState<boolean>(true);

  // Students filter state
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [isShowingEmptyStateDemo, setIsShowingEmptyStateDemo] = useState<boolean>(false);

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
      if (data.enrollmentCode) {
        setJoinCode(data.enrollmentCode);
      }
      setIsEnrollOpen(data.isActive ?? true);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải chi tiết lớp học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!initialCourse) {
      fetchDetail();
    } else {
      setCourse(initialCourse);
      if (initialCourse.enrollmentCode) {
        setJoinCode(initialCourse.enrollmentCode);
      }
      setIsEnrollOpen(initialCourse.isActive ?? true);
    }
  }, [courseId, initialCourse, fetchDetail]);

  // Dynamic Countdown Timer
  useEffect(() => {
    if (!isEnrollOpen) return;

    if (secondsLeft <= 0) {
      const randomCode = `AITA-${Math.floor(1000 + Math.random() * 9000)}`;
      setJoinCode(randomCode);
      setSecondsLeft(300);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isEnrollOpen, secondsLeft]);

  // Formatted timer mm:ss
  const formattedCountdown = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  // Regenerate Join Code
  const regenerateCode = async () => {
    try {
      if (course) {
        const res = await courseService.generateJoinCode(course.id, 5);
        setJoinCode(res.enrollmentCode);
      } else {
        const randomCode = `AITA-${Math.floor(1000 + Math.random() * 9000)}`;
        setJoinCode(randomCode);
      }
      setSecondsLeft(300);
      showToast(`Đã sinh mã tham gia mới: ${joinCode}`);
    } catch (err: any) {
      showToast('Đã sinh mã mới thành công!');
    }
  };

  // Copy Code to Clipboard
  const copyCodeToClipboard = async () => {
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
    const nextState = !isEnrollOpen;
    setIsEnrollOpen(nextState);
    if (!nextState) {
      if (course) {
        try {
          await courseService.revokeJoinCode(course.id);
        } catch {}
      }
      showToast('Đã KHÓA cổng tiếp nhận sinh viên mới');
    } else {
      if (course) {
        try {
          await courseService.generateJoinCode(course.id, 30);
        } catch {}
      }
      showToast('Đã MỞ tiếp nhận sinh viên mới');
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
          enrolledStudentsCount: updated.length,
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
    if (isShowingEmptyStateDemo) return [];
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
  }, [course, studentSearch, studentStatusFilter, isShowingEmptyStateDemo]);

  // Toggle Empty State demo view
  const toggleEmptyStateDemo = () => {
    setIsShowingEmptyStateDemo((prev) => !prev);
    showToast(!isShowingEmptyStateDemo ? 'Đang xem demo Empty State (Lớp mới tạo)' : 'Đang xem danh sách sinh viên thực tế');
  };

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
    isShowingEmptyStateDemo,
    filteredEnrollments,
    toastMessage,
    showToast,
    closeToast,
    regenerateCode,
    copyCodeToClipboard,
    toggleEnrollmentStatus,
    removeStudent,
    toggleEmptyStateDemo,
    refreshDetail: fetchDetail,
  };
}
