// Stub validation for master branch
// Real implementation is in private/auth-system branch

export const emailSchema = {
  parse: (email: string) => ({ email })
}

export const passwordSchema = {
  parse: (password: string) => ({ password })
}

export const loginSchema = {
  parse: (data: any) => data
}

export const signupSchema = {
  parse: (data: any) => data
}