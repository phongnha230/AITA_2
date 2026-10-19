import { redirect } from 'next/navigation';
import { ROUTES } from '@/config/routes';

export default function StudentIndexPage() {
  redirect(ROUTES.STUDENT.DASHBOARD);
}
