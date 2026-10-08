'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type { StudentProfile, StudentProfileUpdate } from '../types/student.types';

export type StudentProfileStatus = 'loading' | 'success' | 'error';

interface StudentProfileContextValue {
  profile: StudentProfile | null;
  status: StudentProfileStatus;
  error: string | null;
  retry: () => void;
  updateProfile: (data: StudentProfileUpdate) => Promise<StudentProfile>;
}

const StudentProfileContext = createContext<StudentProfileContextValue | null>(null);

export function StudentProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [status, setStatus] = useState<StudentProfileStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    studentService
      .getProfile()
      .then((currentProfile) => {
        if (!active) return;
        setProfile(currentProfile);
        setStatus('success');
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setProfile(null);
        setStatus('error');
        setError(
          getStudentServiceErrorMessage(requestError, 'Không thể tải thông tin tài khoản.'),
        );
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setProfile(null);
    setStatus('loading');
    setError(null);
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  const updateProfile = async (data: StudentProfileUpdate) => {
    const updatedProfile = await studentService.updateProfile(data);
    setProfile(updatedProfile);
    setStatus('success');
    setError(null);
    return updatedProfile;
  };

  return (
    <StudentProfileContext.Provider value={{ profile, status, error, retry, updateProfile }}>
      {children}
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile(): StudentProfileContextValue {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error('useStudentProfile must be used within StudentProfileProvider.');
  }
  return context;
}
