const ALLOWED_EMAILS = ['duiliodudu@gmail.com', 'deysinhalmeida@gmail.com'] as const

/** Mesmos lançamentos para as duas contas autorizadas */
export const SHARED_DATA_USER_ID = 'financeiro-deyse'

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase() as (typeof ALLOWED_EMAILS)[number])
}

export function getFirestoreUserId(user: { uid: string; email: string | null }): string {
  if (user.email && isAllowedEmail(user.email)) {
    return SHARED_DATA_USER_ID
  }
  return user.uid
}
