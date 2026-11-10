import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf } from '../access'

export const AdminUsers: CollectionConfig = {
  slug: 'admin-users',
  labels: { singular: 'Utilizator admin', plural: 'Utilizatori admin' },
  admin: { useAsTitle: 'email', group: 'Administrare', defaultColumns: ['email', 'name', 'roles'] },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    useAPIKey: false,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Primul cont creat devine automat administrator.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'admin-users', overrideAccess: true })
          if (totalDocs === 0) return { ...data, roles: ['admin'] }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Nume', type: 'text' },
    {
      name: 'roles',
      label: 'Roluri',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      access: { create: isAdminField, update: isAdminField },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
