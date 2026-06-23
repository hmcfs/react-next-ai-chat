export const PUBLIC_ROUTES = ['/sign-in(.*)', '/sign-up(.*)'];
export const PROTECTED_ROUTES = ['/chat(.*)'];
export function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((route) => new RegExp(route).test(pathname));
}
export function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some((route) => new RegExp(route).test(pathname));
}
