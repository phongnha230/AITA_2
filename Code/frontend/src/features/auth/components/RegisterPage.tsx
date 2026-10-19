import RegisterForm from './RegisterForm';
import { AuthPageLayout } from './AuthPageLayout';

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Đăng ký tài khoản AITA"
      description="Tạo tài khoản sinh viên để sử dụng không gian học tập và khảo thí."
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
