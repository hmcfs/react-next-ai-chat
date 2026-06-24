import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET as string;
export function verifyToken(token: string): null | any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function signToken(payload: Record<string, any>, expire?: number) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expire || 60 * 60 * 24 });
}
export function getId(token: string) {
  return verifyToken(token)?.userId;
}
