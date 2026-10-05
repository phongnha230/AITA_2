import React from 'react';
import { LecturerLayout } from '../../components/layout/LecturerLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LecturerLayout>{children}</LecturerLayout>;
}
