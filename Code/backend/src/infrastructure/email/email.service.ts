import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.SMTP_USER && env.SMTP_PASS && env.SMTP_PASS !== 'abcd efgh ijkl mnop') {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(env.SMTP_PORT) || 587,
          secure: Number(env.SMTP_PORT) === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS.replace(/\s+/g, ''), // Loại bỏ khoảng trắng trong mã Google App Password
          },
        });
      } catch (err) {
        console.error('❌ [EmailService] Không thể khởi tạo SMTP transporter:', err);
      }
    }
  }

  public async sendOtpEmail(toEmail: string, otpCode: string, fullName?: string): Promise<boolean> {
    const greeting = fullName ? `Xin chào <strong>${fullName}</strong>,` : 'Xin chào bạn,';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Hệ thống AITA - FPT University</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Xác thực tài khoản người dùng</p>
        </div>
        <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 15px;">${greeting}</p>
          <p style="font-size: 14px;">Bạn đang thực hiện thao tác đăng ký tài khoản trên hệ thống <strong>AITA (AI-powered Teaching Assistant)</strong>. Dưới đây là mã xác thực OTP của bạn:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #4f46e5; border-radius: 10px; padding: 14px 32px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otpCode}</span>
            </div>
          </div>
          
          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            ⏱️ Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.
          </p>
          <p style="font-size: 13px; color: #ef4444; margin-top: 0;">
            ⚠️ Tuyệt đối không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
          </p>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.<br />
          © ${new Date().getFullYear()} AITA Platform. All rights reserved.
        </div>
      </div>
    `;

    // Nếu chưa cấu hình SMTP hoặc cấu hình mẫu, in ra console để dev test thuận tiện
    if (!this.transporter) {
      console.log(`\n======================================================`);
      console.log(`📧 [MOCK EMAIL] OTP cho [${toEmail}]: === ${otpCode} ===`);
      console.log(`⚠️ SMTP chưa được điền thông tin thật trong .env, mã OTP được in tại console.`);
      console.log(`======================================================\n`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM || `"AITA System" <${env.SMTP_USER}>`,
        to: toEmail,
        subject: `[AITA] Mã xác thực OTP của bạn: ${otpCode}`,
        html: htmlContent,
      });
      console.log(`✅ [EmailService] Đã gửi OTP thành công tới: ${toEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Lỗi gửi email tới ${toEmail}:`, error);
      // Vẫn in OTP ra console để người dùng không bị kẹt khi test lỗi SMTP
      console.log(`📧 [FALLBACK OTP] Mã OTP dự phòng: ${otpCode}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
