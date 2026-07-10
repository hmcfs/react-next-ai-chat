export class AppError extends Error {
  public readonly code: number;
  public readonly statusCode: number;
  constructor(message: string, code: number, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
export class AuthError extends AppError {
  constructor(message = '请先登录') {
    super(message, 401, 401);
    this.name = 'AuthError';
  }
}
export class ValidationError extends AppError {
  constructor(message = '参数校验失败') {
    super(message, 400, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404, 404);
    this.name = 'NotFoundError';
  }
}
export class customError extends AppError {
  constructor(message: string) {
    super(message, 0, 400);
    this.name = 'customError';
  }
}
