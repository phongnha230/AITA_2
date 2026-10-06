'use client';

import { useEffect, useState } from 'react';
import { useStudentProfile } from './useStudentProfile';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type { ResourceState, StudentCourse } from '../types/student.types';

const loadingState = <T,>(data: T): ResourceState<T> => ({
  status: 'loading',
  data,
  error: null,
});

export function useStudentCourses() {
  const { profile, status: profileStatus, error: profileError, retry: retryProfile } = useStudentProfile();
  const [courses, setCourses] = useState<ResourceState<StudentCourse[]>>(loadingState([]));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    if (profileStatus === 'loading') {
      setCourses(loadingState([]));
      return () => { active = false; };
    }

    if (profileStatus === 'error' || !profile) {
      setCourses({
        status: 'error',
        data: [],
        error: 'Chưa thể tải dữ liệu lớp học.',
      });
      return () => { active = false; };
    }

    setCourses(loadingState([]));
    studentService
      .getCourses(profile.id)
      .then((courseList) => {
        if (active) setCourses({ status: 'success', data: courseList, error: null });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setCourses({
          status: 'error',
          data: [],
          error: getStudentServiceErrorMessage(requestError, 'Không thể tải dữ liệu lớp học.'),
        });
      });

    return () => { active = false; };
  }, [profile, profileError, profileStatus, attempt]);

  const retryCourses = () => {
    if (profileStatus === 'error') {
      retryProfile();
      return;
    }
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  return { profile, profileStatus, profileError, retryProfile, courses, retryCourses };
}
