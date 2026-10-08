'use client';

import { useState } from 'react';
import { useStudentAcademicData } from './useStudentAcademicData';
import { mapStudentExams } from '../utils/student-exam.utils';
import type { StudentExamTemporalStatus, StudentExamViewModel } from '../types/student.types';

export type ExamFilter = 'ALL' | 'OPEN' | 'UPCOMING' | 'ENDED';
export type ExamSort = 'NEAREST' | 'NEWEST';

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('vi-VN');
}

function compareDates(first: string, second: string, direction: 'asc' | 'desc'): number {
  const firstTime = Date.parse(first);
  const secondTime = Date.parse(second);
  const safeFirst = Number.isFinite(firstTime) ? firstTime : Number.POSITIVE_INFINITY;
  const safeSecond = Number.isFinite(secondTime) ? secondTime : Number.POSITIVE_INFINITY;
  return direction === 'asc' ? safeFirst - safeSecond : safeSecond - safeFirst;
}

export function useStudentExams() {
  const academic = useStudentAcademicData();
  const [filter, setFilter] = useState<ExamFilter>('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ExamSort>('NEAREST');
  const exams: StudentExamViewModel[] = academic.assignments.status === 'success'
    ? mapStudentExams(academic.assignments.data, academic.courses.data)
    : [];
  const normalizedSearch = normalizeSearch(search);

  const filteredExams = exams
    .filter((exam) => {
      if (filter !== 'ALL' && exam.temporalStatus !== filter as StudentExamTemporalStatus) {
        return false;
      }

      if (!normalizedSearch) return true;
      const haystack = normalizeSearch([
        exam.assignment.title,
        exam.course?.code ?? '',
        exam.course?.name ?? '',
      ].join(' '));
      return haystack.includes(normalizedSearch);
    })
    .sort((first, second) => sort === 'NEAREST'
      ? compareDates(first.assignment.startTime, second.assignment.startTime, 'asc')
      : compareDates(first.assignment.createdAt, second.assignment.createdAt, 'desc'));

  const available = academic.assignments.status === 'success';
  const openCount = available ? exams.filter((exam) => exam.temporalStatus === 'OPEN').length : null;
  const upcomingCount = available ? exams.filter((exam) => exam.temporalStatus === 'UPCOMING').length : null;
  const endedCount = available ? exams.filter((exam) => exam.temporalStatus === 'ENDED').length : null;
  const environmentCount = available
    ? new Set(exams.map(({ assignment }) => assignment.environment)).size
    : null;

  return {
    ...academic,
    exams,
    filteredExams,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    setSort,
    openCount,
    upcomingCount,
    endedCount,
    environmentCount,
    refresh: academic.retryCourses,
  };
}
