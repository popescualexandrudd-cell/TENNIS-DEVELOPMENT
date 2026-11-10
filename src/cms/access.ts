import type { Access, FieldAccess, Where } from 'payload'

type Role = 'admin' | 'editor'

type MaybeUser = { collection?: string; roles?: Role[] | null } | null | undefined

function adminUser(user: unknown): MaybeUser {
  const u = user as MaybeUser
  return u && u.collection === 'admin-users' ? u : null
}

export const isAuthenticated: Access = ({ req }) => Boolean(adminUser(req.user))

export const isAdmin: Access = ({ req }) => Boolean(adminUser(req.user)?.roles?.includes('admin'))

export const isAdminField: FieldAccess = ({ req }) => Boolean(adminUser(req.user)?.roles?.includes('admin'))

/** Public: numai documente publicate. Editorii autentificați văd tot. */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (adminUser(req.user)) return true
  const where: Where = { _status: { equals: 'published' } }
  return where
}

export const isAdminOrSelf: Access = ({ req }) => {
  const user = adminUser(req.user) as (MaybeUser & { id?: number | string }) | null
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return { id: { equals: user.id } }
}

export const nobody: Access = () => false
export const anyone: Access = () => true
