'use client';

import { useEffect, useState } from 'react';
import { useStudentAcademicData } from './useStudentAcademicData';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type { PublicSandboxHealth, ResourceState, StudentPortfolioData } from '../types/student.types';

const loadingState = <T,>(data: T): ResourceState<T> => ({
  status: 'loading',
  data,
  error: null,
});

export function useStudentDashboard() {
  const academic = useStudentAcademicData();
  const [sandbox, setSandbox] = useState<ResourceState<PublicSandboxHealth | null>>(() =>
    loadingState<PublicSandboxHealth | null>(null),
  );
  const [sandboxAttempt, setSandboxAttempt] = useState(0);
  const [portfolio, setPortfolio] = useState<ResourceState<StudentPortfolioData | null>>(() =>
    loadingState<StudentPortfolioData | null>(null),
  );
  const [portfolioAttempt, setPortfolioAttempt] = useState(0);
  const now = Date.now();
  const upcomingAssignments = academic.assignments.status === 'success'
    ? academic.assignments.data
        .filter((assignment) => {
          const startTime = Date.parse(assignment.startTime);
          return assignment.status === 'PUBLISHED' && Number.isFinite(startTime) && startTime > now;
        })
        .sort((first, second) => Date.parse(first.startTime) - Date.parse(second.startTime))
    : [];

  const completedAssignments = academic.assignments.status === 'success'
    ? academic.assignments.data.filter((assignment) => {
        const deadline = Date.parse(assignment.deadline);
        return assignment.status === 'CLOSED' || (Number.isFinite(deadline) && deadline < now);
      })
    : [];

  useEffect(() => {
    let active = true;

    studentService
      .getSandboxHealth()
      .then((sandboxStatus) => {
        if (active) setSandbox({ status: 'success', data: sandboxStatus, error: null });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        console.error('Không kiểm tra được trạng thái Docker Sandbox:', requestError);
        setSandbox({
          status: 'error',
          data: null,
          error: getStudentServiceErrorMessage(requestError, 'Không thể kiểm tra Sandbox.'),
        });
      });

    return () => { active = false; };
  }, [sandboxAttempt]);

  useEffect(() => {
    let active = true;

    studentService
      .getPortfolio()
      .then((data) => {
        if (active) setPortfolio({ status: 'success', data, error: null });
      })
      .catch((requestError: unknown) => {
        console.error('Không tải được dữ liệu portfolio trên dashboard:', requestError);
        if (active) {
          setPortfolio({
            status: 'error',
            data: null,
            error: getStudentServiceErrorMessage(requestError, 'Không thể tải hoạt động và điểm trung bình.'),
          });
        }
      });

    return () => { active = false; };
  }, [portfolioAttempt]);

  const retrySandbox = () => {
    setSandbox(loadingState<PublicSandboxHealth | null>(null));
    setSandboxAttempt((attempt) => attempt + 1);
  };

  const retryPortfolio = () => {
    setPortfolio(loadingState<StudentPortfolioData | null>(null));
    setPortfolioAttempt((attempt) => attempt + 1);
  };

  const joinCourse = async (code: string) => {
    const result = await studentService.joinCourse(code);
    academic.retryCourses();
    return result;
  };

  return {
    ...academic,
    upcomingAssignments,
    completedAssignments,
    sandbox,
    retrySandbox,
    portfolio,
    retryPortfolio,
    joinCourse,
  };
}

