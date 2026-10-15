import { env } from '../config/env.js';

export class RecaptchaService {
  /**
   * Xác thực token reCAPTCHA từ client gửi lên với Google API
   * @param token Chuỗi response token từ widget Google reCAPTCHA
   */
  public async verifyRecaptcha(token?: string): Promise<{ success: boolean; message?: string }> {
    // Nếu chưa cấu hình secret key hoặc đang để trống trong lúc dev, cho phép vượt qua
    if (!env.RECAPTCHA_SECRET_KEY || env.RECAPTCHA_SECRET_KEY.trim() === '') {
      console.warn('⚠️ [reCAPTCHA] RECAPTCHA_SECRET_KEY chưa được điền trong .env. Bỏ qua xác thực để thử nghiệm.');
      return { success: true };
    }

    if (!token || token.trim() === '') {
      return { success: false, message: 'Vui lòng hoàn tất xác thực "Tôi không phải người máy" (reCAPTCHA).' };
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: env.RECAPTCHA_SECRET_KEY.trim(),
          response: token.trim(),
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        challenge_ts?: string;
        hostname?: string;
        'error-codes'?: string[];
      };

      if (!data.success) {
        console.error('❌ [reCAPTCHA] Google xác thực thất bại:', data['error-codes']);
        return {
          success: false,
          message: 'Xác thực reCAPTCHA thất bại hoặc phiên đã hết hạn. Vui lòng thử lại.',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [reCAPTCHA] Lỗi khi kết nối đến máy chủ Google:', error);
      // Nếu Google API bị nghẽn mạng trong môi trường dev, không chặn người dùng
      if (env.NODE_ENV !== 'production') {
        return { success: true };
      }
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực Google reCAPTCHA.' };
    }
  }
}

export const recaptchaService = new RecaptchaService();
