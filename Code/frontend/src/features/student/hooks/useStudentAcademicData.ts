'use client';

import { useEffect, useState } from 'react';
import { useStudentCourses } from './useStudentCourses';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type { ResourceState, StudentAssignment } from '../types/student.types';

const loadingState = <T,>(data: T): ResourceState<T> => ({
  status: 'loading',
  data,
  error: null,
});

export function useStudentAcademicData() {
  const academic = useStudentCourses();
  const { courses } = academic;
  const [assignments, setAssignments] = useState<ResourceState<StudentAssignment[]>>(() => loadingState([]));
  const [assignmentAttempt, setAssignmentAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    if (courses.status === 'loading') {
      setAssignments(loadingState([]));
      return () => { active = false; };
    }

    if (courses.status === 'error') {
      setAssignments({ status: 'error', data: [], error: 'Chưa thể tải dữ liệu bài thi.' });
      return () => { active = false; };
    }

    if (courses.data.length === 0) {
      setAssignments({ status: 'success', data: [], error: null });
      return () => { active = false; };
    }

    setAssignments(loadingState([]));
    Promise.all(courses.data.map((course) => studentService.getAssignmentsByCourse(course.id)))
      .then((courseAssignments) => {
        if (active) {
          setAssignments({ status: 'success', data: courseAssignments.flat(), error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setAssignments({
          status: 'error',
          data: [],
          error: getStudentServiceErrorMessage(requestError, 'Không thể tải dữ liệu bài thi.'),
        });
      });

    return () => { active = false; };
  }, [courses, assignmentAttempt]);

  const retryAssignments = () => {
    if (academic.profileStatus === 'error' || courses.status === 'error') {
      academic.retryCourses();
      return;
    }
    setAssignmentAttempt((attempt) => attempt + 1);
  };

  return { ...academic, assignments, retryAssignments };
}
