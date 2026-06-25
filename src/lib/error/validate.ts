import { ValidationError } from './error';

export function baseValidate(param: string | number | null | undefined, msg: string) {
  if (param === undefined || param === null || (typeof param === 'string' && param.trim() === ''))
    throw new ValidationError(msg);
  return param;
}
export function conditionValidate(condition: boolean, msg: string) {
  if (!condition) throw new ValidationError(msg);
}
