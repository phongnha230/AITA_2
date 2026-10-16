'use client';

import { useMemo } from 'react';
import type { StudentExamViewModel } from '../types/student.types';

interface UseStudentExamsFilterInput {
  exams: StudentExamViewModel[];
  filteredExams: StudentExamViewModel[];
  filter: string;
  search: string;
  status: string;
  openCount: number | null;
  upcomingCount: number | null;
  endedCount: number | null;
  pausedCount: number | null;
}

export function useStudentExamsFilter(input: UseStudentExamsFilterInput) {
  const {
    exams,
    filteredExams,
    filter,
    search,
    status,
    openCount,
    upcomingCount,
    endedCount,
    pausedCount,
  } = input;

  const filterCounts = useMemo(() => ({
    all: status === 'success' ? exams.length : null,
    open: openCount,
    upcoming: upcomingCount,
    ended: endedCount,
    paused: pausedCount,
  }), [status, exams.length, openCount, upcomingCount, endedCount, pausedCount]);

  const canShowLists = status === 'success';

  const visibleActive = useMemo(() => {
    if (filter !== 'ALL' && filter !== 'OPEN') return [];
    return filteredExams.filter((exam) => exam.temporalStatus === 'OPEN');
  }, [filter, filteredExams]);

  const otherOpenExams = visibleActive.slice(1);
  const featuredExam = visibleActive[0];

  const visibleUpcoming = useMemo(() => {
    if (filter !== 'ALL' && filter !== 'UPCOMING') return [];
    return filteredExams.filter((exam) => exam.temporalStatus === 'UPCOMING');
  }, [filter, filteredExams]);

  const visibleEnded = useMemo(() => {
    if (filter !== 'ALL' && filter !== 'ENDED') return [];
    return filteredExams.filter((exam) => exam.temporalStatus === 'ENDED');
  }, [filter, filteredExams]);

  const visiblePaused = useMemo(() => {
    if (filter !== 'ALL' && filter !== 'PAUSED') return [];
    return filteredExams.filter((exam) => exam.temporalStatus === 'PAUSED');
  }, [filter, filteredExams]);

  const unknownExams = useMemo(() => {
    return filteredExams.filter((exam) => exam.temporalStatus === 'UNKNOWN');
  }, [filteredExams]);

  const noExamsAtAll = canShowLists && exams.length === 0 && filter === 'ALL' && !search;
  const showNoMatches = canShowLists && filteredExams.length === 0 && !noExamsAtAll;

  return {
    filterCounts,
    canShowLists,
    otherOpenExams,
    featuredExam,
    visibleUpcoming,
    visibleEnded,
    visiblePaused,
    unknownExams,
    noExamsAtAll,
    showNoMatches,
  };
}
