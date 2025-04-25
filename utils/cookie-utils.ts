export function setCrossSiteCookie(name: string, value: string, options: any = {}) {
  const defaultOptions = {
    path: '/',
    sameSite: 'None',
    secure: true,
    partitioned: true,
    ...options
  }

  const cookieString = `${name}=${value}; Path=${defaultOptions.path}; SameSite=None; Secure; HttpOnly${defaultOptions.partitioned ? '; Partitioned' : ''}`
  
  if (typeof window !== 'undefined' && !navigator.userAgent.includes('HeadlessChrome')) {
    document.cookie = cookieString
  }
  return cookieString
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined' || navigator.userAgent.includes('HeadlessChrome')) {
    return null
  }
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

export function deleteCookie(name: string) {
  if (typeof window !== 'undefined' && !navigator.userAgent.includes('HeadlessChrome')) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure; HttpOnly`
  }
}