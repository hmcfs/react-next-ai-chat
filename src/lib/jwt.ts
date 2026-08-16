// BBF 代理层 JWT 验证工具（仅验证，不签名）
import { UserInfo } from '@/types/user.type';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET as string;

export function verifyToken(token: string): UserInfo | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserInfo;
  } catch {
    return null;
  }
}

export function getUserInfoByToken(token: string): UserInfo | null {
  const payload = verifyToken(token);
  console.log('JWT Payload:', payload);
  return payload as UserInfo | null;
}
