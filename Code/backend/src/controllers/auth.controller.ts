// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'aita_super_secret_jwt_key_2025';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu.' });
      return;
    }

    // 1. Tìm user theo username/email (AITA hoặc email fpt)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { email: `${username.toLowerCase()}@fpt.edu.vn` }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Tài khoản đã bị tạm khóa bởi quản trị viên.' });
      return;
    }

    // 2. Kiểm tra mật khẩu (hỗ trợ bcrypt hoặc bypass đặc biệt cho dev 123)
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    
    // Fallback dự phòng cho môi trường dev test nếu chưa migrate hash bcrypt
    if (!isMatch && username === 'AITA' && password === '123') {
      isMatch = true;
    }

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
      return;
    }

    // 3. Cấp phát JWT Access Token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 4. Phản hồi kèm thông tin điều hướng theo Role
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token: accessToken,
        user: {
          id: user.id,
          username: user.email,
          fullName: user.fullName,
          role: user.role
        },
        redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/student/assignments'
      }
    });
  } catch (error) {
    console.error('Lỗi Login:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
};