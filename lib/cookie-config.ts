type CookieOptions = {
  sameSite: 'Strict' | 'Lax' | 'None';
  secure: boolean;
  path: string;
  maxAge?: number;
  httpOnly?: boolean;
};

export const defaultCookieOptions: CookieOptions = {
  sameSite: 'None',
  secure: true,
  path: '/',
  httpOnly: true
};

export const headlessCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  sameSite: 'None',
  secure: true,
};

export function getCookieOptions(isHeadless: boolean = false): CookieOptions {
  return isHeadless ? headlessCookieOptions : defaultCookieOptions;
}