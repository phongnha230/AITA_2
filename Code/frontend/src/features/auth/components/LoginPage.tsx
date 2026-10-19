import LoginForm from './LoginForm';
import { AuthPageLayout } from './AuthPageLayout';

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Đăng nhập vào AITA"
      description="Sử dụng tài khoản của bạn để tiếp tục đến không gian học tập và khảo thí."
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
