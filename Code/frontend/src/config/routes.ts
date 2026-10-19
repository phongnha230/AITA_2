/**
 * ==============================================================================
 * AITA WEB ROUTE SYSTEM (SINGLE SOURCE OF TRUTH)
 * ==============================================================================
 * File quản lý tập trung toàn bộ Routes trong hệ thống AITA Frontend.
 * Đảm bảo 100% Type-Safe, cấu trúc phân quyền theo Role (ADMIN, LECTURER, STUDENT),
 * hỗ trợ Dynamic Routes (params) và điều hướng Dashboard tự động.
 */

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

/**
 * Danh mục đường dẫn (Routes) toàn hệ thống.
 * Sử dụng 'as const' để giữ nguyên literal type string, chống typo khi gõ code.
 */
export const ROUTES = {
  // 1. PUBLIC & ROOT
  PUBLIC: {
    HOME: '/',
  },

  // 2. AUTHENTICATION
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    GOOGLE_CALLBACK: '/auth/callback',
  },

  // 3. ADMIN PORTAL (Quản trị viên) - Prefix: /admin
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    SUBMISSIONS: '/admin/submissions',
    AI_KEYS: '/admin/ai-keys',
    QUEUE: '/admin/queue',
    DOCKER: '/admin/docker',
  },

  // 4. LECTURER PORTAL (Giảng viên) - Prefix: /lecturer
  LECTURER: {
    ROOT: '/lecturer',
    DASHBOARD: '/lecturer/dashboard',
    COURSES: '/lecturer/courses',
    COURSE_DETAIL: (courseId: string | number) => `/lecturer/courses/${courseId}`,
    EXAM_BANK: '/lecturer/exam-bank',
    EXAM_BANK_CREATE: '/lecturer/exam-bank/create',
    EXAM_BANK_DETAIL: (examId: string | number) => `/lecturer/exam-bank/${examId}`,
    EXAM_BANK_SUBMISSIONS: (examId: string | number) => `/lecturer/exam-bank/${examId}/submissions`,
    LIVE_PROCTORING: '/lecturer/live-proctoring',
    LIVE_PROCTORING_ROOM: (roomId: string | number) => `/lecturer/live-proctoring/${roomId}`,
  },

  // 5. STUDENT PORTAL (Sinh viên) - Prefix: /student
  STUDENT: {
    ROOT: '/student',
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    EXAMS: '/student/exams',
    RESULTS: '/student/results',
    PROFILE: '/student/profile',
    REGULATIONS: '/student/regulations',
  },
} as const;

/**
 * Bản đồ Dashboard mặc định theo từng Role trong hệ thống.
 * Bất cứ khi nào user đăng nhập thành công hoặc cần redirect về trang chủ,
 * chỉ cần gọi `getDashboardRouteByRole(user.role)`.
 */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  ADMIN: ROUTES.ADMIN.DASHBOARD,       // -> /admin/dashboard
  LECTURER: ROUTES.LECTURER.DASHBOARD, // -> /lecturer/dashboard
  STUDENT: ROUTES.STUDENT.DASHBOARD,   // -> /student/dashboard
};

/**
 * Lấy route dashboard tương ứng với vai trò của user.
 * Nếu không có role hoặc role không hợp lệ -> fallback về trang Login.
 */
export function getDashboardRouteByRole(role?: string | null): string {
  if (!role) return ROUTES.AUTH.LOGIN;
  const upperRole = role.toUpperCase() as UserRole;
  return ROLE_DASHBOARDS[upperRole] || ROUTES.AUTH.LOGIN;
}

/**
 * Kiểm tra xem pathname hiện tại có phải là route Auth không.
 */
export function isAuthRoute(pathname: string): boolean {
  return (
    pathname === ROUTES.AUTH.LOGIN ||
    pathname === ROUTES.AUTH.REGISTER ||
    pathname === ROUTES.AUTH.VERIFY_OTP ||
    pathname.startsWith('/auth')
  );
}

/**
 * Kiểm tra phân quyền truy cập route dựa trên Role.
 * Dùng cho AuthGuard, Middleware hoặc Sidebar navigation.
 */
export function isRouteAllowed(pathname: string, userRole?: string | null): boolean {
  if (isAuthRoute(pathname) || pathname === ROUTES.PUBLIC.HOME) {
    return true;
  }

  if (!userRole) return false;
  const role = userRole.toUpperCase() as UserRole;

  // Quyền truy cập khu vực Admin
  if (pathname.startsWith('/admin')) {
    return role === 'ADMIN';
  }

  // Quyền truy cập khu vực Student
  if (pathname.startsWith('/student')) {
    return role === 'STUDENT' || role === 'ADMIN';
  }

  // Quyền truy cập khu vực Lecturer (hỗ trợ cả /lecturer và alias /lecture)
  if (pathname.startsWith('/lecturer') || pathname.startsWith('/lecture')) {
    return role === 'LECTURER' || role === 'ADMIN';
  }

  return true;
}
