import { AdminCoursesPage } from '@/features/admin/components/courses/AdminCoursesPage';

export const metadata = {
  title: 'Quản lý Khóa học & Lớp học | AITA Admin',
  description: 'Quản trị danh sách khóa học, phân công giảng viên và quản lý sinh viên toàn trường',
};

export default function AdminCoursesRoute() {
  return <AdminCoursesPage />;
}
