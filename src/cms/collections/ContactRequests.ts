import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { isAdmin, nobody } from '../access'
import { sendContactNotification } from '../../features/contact/notify'

/**
 * Solicitări primite prin formular. Create numai prin `POST /api/contact` (Local API).
 * Accesibile exclusiv administratorilor; API-ul REST public nu le poate citi sau crea.
 */
const resendHook: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation }) => {
  if (operation !== 'update' || !doc.resendNotification || previousDoc?.resendNotification) return doc
  const result = await sendContactNotification(req.payload, doc)
  await req.payload.update({
    collection: 'contact-requests',
    id: doc.id,
    overrideAccess: true,
    req,
    context: { skipResend: true },
    data: {
      resendNotification: false,
      notificationStatus: result.ok ? 'sent' : 'failed',
      notificationError: result.ok ? null : result.error,
    },
  })
  return doc
}

export const ContactRequests: CollectionConfig = {
  slug: 'contact-requests',
  labels: { singular: 'Solicitare de contact', plural: 'Solicitări de contact' },
  admin: {
    useAsTitle: 'name',
    group: 'Solicitări',
    defaultColumns: ['name', 'requestType', 'status', 'notificationStatus', 'createdAt'],
  },
  access: { read: isAdmin, create: nobody, update: isAdmin, delete: isAdmin },
  hooks: {
    afterChange: [
      async (args) => (args.context?.skipResend ? args.doc : resendHook(args)),
    ],
  },
  fields: [
    { name: 'name', label: 'Nume', type: 'text', required: true, maxLength: 120 },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Telefon (opțional)', type: 'text', maxLength: 24 },
    {
      name: 'requestType',
      label: 'Tip solicitare',
      type: 'select',
      required: true,
      options: [
        { label: 'Antrenamente', value: 'coaching' },
        { label: 'Colaborare', value: 'collaboration' },
        { label: 'Altceva', value: 'other' },
      ],
    },
    { name: 'message', label: 'Mesaj', type: 'textarea', required: true, maxLength: 4000 },
    {
      name: 'locale',
      label: 'Limba formularului',
      type: 'select',
      options: [
        { label: 'RO', value: 'ro' },
        { label: 'EN', value: 'en' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'Nouă', value: 'new' },
        { label: 'În lucru', value: 'in_progress' },
        { label: 'Răspuns trimis', value: 'answered' },
        { label: 'Arhivată', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notificationStatus',
      label: 'Notificare email',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'În așteptare', value: 'pending' },
        { label: 'Trimisă', value: 'sent' },
        { label: 'Eșuată', value: 'failed' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'notificationError', label: 'Eroare notificare', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'resendNotification',
      label: 'Retrimite notificarea la salvare',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
      access: { read: () => false, update: () => false },
    },
  ],
}
