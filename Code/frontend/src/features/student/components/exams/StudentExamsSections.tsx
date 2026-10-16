'use client';

import React from 'react';
import type { StudentExamViewModel } from '../../types/student.types';
import { ExamCard } from './ExamCard';
import { ExamListSection } from './ExamListSection';

interface StudentExamsSectionsProps {
  canShowLists: boolean;
  noExamsAtAll: boolean;
  showNoMatches: boolean;
  filter: string;
  search: string;
  featuredExam?: StudentExamViewModel;
  otherOpenExams: StudentExamViewModel[];
  visibleUpcoming: StudentExamViewModel[];
  visibleEnded: StudentExamViewModel[];
  visiblePaused: StudentExamViewModel[];
  unknownExams: StudentExamViewModel[];
}

const UpcomingExamsBlock: React.FC<{
  show: boolean;
  exams: StudentExamViewModel[];
  search: string;
}> = ({ show, exams, search }) => {
  if (!show) return null;
  return (
    <ExamListSection
      title="Bài sắp tới"
      description="Các bài đã xuất bản và chưa đến thời gian bắt đầu."
      exams={exams}
      emptyTitle={search ? 'Không tìm thấy bài phù hợp.' : 'Không có bài sắp tới.'}
      emptyDescription={
        search
          ? 'Thử từ khóa khác hoặc đổi bộ lọc trạng thái.'
          : 'Các bài sắp tới sẽ xuất hiện tại đây khi được giảng viên công bố.'
      }
    />
  );
};

const EndedExamsBlock: React.FC<{
  show: boolean;
  exams: StudentExamViewModel[];
}> = ({ show, exams }) => {
  if (!show) return null;
  return (
    <ExamListSection
      title="Đã kết thúc theo thời gian"
      description="Các bài đã đóng hoặc đã qua hạn nộp."
      exams={exams}
      emptyTitle="Không có bài đã kết thúc."
      emptyDescription=""
    />
  );
};

const UnknownExamsBlock: React.FC<{
  show: boolean;
  exams: StudentExamViewModel[];
}> = ({ show, exams }) => {
  if (!show) return null;
  return (
    <ExamListSection
      title="Chưa xác định thời gian"
      description="Các bài chưa thiết lập khung thời gian cụ thể."
      exams={exams}
      emptyTitle="Không có bài thiếu thời gian."
      emptyDescription=""
    />
  );
};

export const StudentExamsSections: React.FC<StudentExamsSectionsProps> = ({
  canShowLists,
  noExamsAtAll,
  showNoMatches,
  filter,
  search,
  featuredExam,
  otherOpenExams,
  visibleUpcoming,
  visibleEnded,
  visiblePaused,
  unknownExams,
}) => {
  if (!canShowLists || noExamsAtAll) return null;

  return (
    <>
      {featuredExam && <ExamCard exam={featuredExam} featured />}

      {otherOpenExams.length > 0 && (
        <ExamListSection
          title="Các bài đang mở"
          description="Các bài nằm trong khung thời gian thực hiện."
          exams={otherOpenExams}
          emptyTitle="Không có bài đang mở."
          emptyDescription=""
        />
      )}

      <UpcomingExamsBlock
        show={!showNoMatches && (filter === 'ALL' || filter === 'UPCOMING')}
        exams={visibleUpcoming}
        search={search}
      />

      <EndedExamsBlock
        show={!showNoMatches && (filter === 'ALL' || filter === 'ENDED')}
        exams={visibleEnded}
      />

      {(filter === 'ALL' || filter === 'PAUSED') && visiblePaused.length > 0 && (
        <ExamListSection
          title="Đang tạm dừng"
          description="Giảng viên đã tạm khóa nội dung và nộp bài cho ca này."
          exams={visiblePaused}
          emptyTitle="Không có bài đang tạm dừng."
          emptyDescription=""
        />
      )}

      <UnknownExamsBlock
        show={!showNoMatches && filter === 'ALL' && unknownExams.length > 0}
        exams={unknownExams}
      />
    </>
  );
};
