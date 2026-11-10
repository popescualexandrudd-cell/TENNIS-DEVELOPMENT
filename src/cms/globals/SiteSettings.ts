import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { isAdmin } from '../access'
import { revalidateWholeSite } from '../hooks/revalidate'

const afterChange: GlobalAfterChangeHook = async ({ req, doc }) => {
  await revalidateWholeSite(req)
  return doc
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Setări site',
  admin: { group: 'Administrare' },
  access: { read: () => true, update: isAdmin },
  hooks: { afterChange: [afterChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identitate',
          fields: [
            { name: 'personName', label: 'Nume', type: 'text', required: true, defaultValue: 'Daniel Popescu' },
            { name: 'jobTitle', label: 'Ocupație (date structurate)', type: 'text', localized: true },
            { name: 'signature', label: 'Semnătură secundară', type: 'text', localized: true },
            {
              name: 'englishEnabled',
              label: 'Versiunea în engleză este publică',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Cât timp e debifat, rutele /en returnează 404 și selectorul de limbă e ascuns.' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', label: 'Email public', type: 'email' },
            { name: 'phone', label: 'Telefon public (opțional)', type: 'text' },
            { name: 'location', label: 'Zona de activitate confirmată', type: 'text', localized: true },
            {
              name: 'acceptTestimonials',
              label: 'Sportivii pot trimite păreri de pe site',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Afișează formularul „Lasă o părere” la „Ce spun jucătorii”. Părerile apar doar după aprobare.' },
            },
            {
              name: 'social',
              label: 'Social media verificate',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: ['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin', 'x'].map((v) => ({ label: v, value: v })),
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO implicit',
          fields: [
            { name: 'defaultTitle', label: 'Titlu implicit', type: 'text', localized: true },
            { name: 'defaultDescription', label: 'Descriere implicită', type: 'textarea', localized: true },
            { name: 'defaultImage', label: 'Imagine Open Graph implicită', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
