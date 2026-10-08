'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'student-demo',
  email: 'student@fpt.edu.vn',
  fullName: 'Sinh viên FPT',
  role: 'STUDENT',
  status: 'ACTIVE',
  avatarUrl: null,
};

export function StudentProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(DEFAULT_STUDENT_PROFILE);
  const [status, setStatus] = useState<StudentProfileStatus>('success');
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
      .catch((_requestError: unknown) => {
        if (!active) return;
        // Fallback to default student profile when offline or unauthenticated
        setProfile(DEFAULT_STUDENT_PROFILE);
        setStatus('success');
        setError(null);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  const updateProfile = useCallback(async (data: StudentProfileUpdate) => {
    try {
      const updatedProfile = await studentService.updateProfile(data);
      setProfile(updatedProfile);
      setStatus('success');
      setError(null);
      return updatedProfile;
    } catch {
      const updated = { ...(profile ?? DEFAULT_STUDENT_PROFILE), ...data };
      setProfile(updated);
      return updated;
    }
  }, [profile]);

  const value = useMemo(
    () => ({ profile, status, error, retry, updateProfile }),
    [profile, status, error, retry, updateProfile],
  );

  return (
    <StudentProfileContext.Provider value={value}>
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
