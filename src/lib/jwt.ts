// BBF 代理层 JWT 验证工具（仅验证，不签名）
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function verifyToken(token: string): Record<string, any> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): number | null {
  const payload = verifyToken(token);
  return payload?.userId ? Number(payload.userId) : null;
}
