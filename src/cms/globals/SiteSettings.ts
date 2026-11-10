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
            {
              name: 'whatsapp',
              label: 'WhatsApp (număr pentru butonul „Scrie-mi pe WhatsApp”)',
              type: 'text',
              admin: { description: 'Ex. 0726 409 988 sau +40 726 409 988. Gol = butonul nu apare.' },
              validate: (value: unknown) => {
                if (!value) return true
                const digits = String(value).replace(/\D/g, '')
                return digits.length >= 9 && digits.length <= 15 ? true : 'Număr de telefon invalid.'
              },
            },
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
          label: 'Date legale',
          description:
            'Folosite automat în Confidențialitate, Cookies și Termeni (decizia 0013). Până nu sunt completate câmpurile obligatorii, paginile legale nu apar în producție.',
          fields: [
            {
              name: 'legal',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'entityType',
                  label: 'Formă juridică a operatorului',
                  type: 'select',
                  defaultValue: 'individual',
                  required: true,
                  options: [
                    { label: 'Persoană fizică', value: 'individual' },
                    { label: 'PFA / Întreprindere individuală', value: 'pfa' },
                    { label: 'Societate (SRL etc.)', value: 'company' },
                  ],
                },
                { name: 'legalName', label: 'Denumire / nume complet (obligatoriu)', type: 'text', admin: { description: 'Ex. „Daniel Popescu”, „Popescu Daniel PFA” sau „Exemplu Tenis SRL”.' } },
                {
                  name: 'taxId',
                  label: 'CUI / CIF (obligatoriu pentru PFA și societate)',
                  type: 'text',
                  admin: { condition: (_, s) => s?.entityType !== 'individual' },
                },
                {
                  name: 'tradeRegister',
                  label: 'Nr. Registrul Comerțului (ex. F40/1234/2026, J40/…)',
                  type: 'text',
                  admin: { condition: (_, s) => s?.entityType !== 'individual' },
                },
                {
                  name: 'address',
                  label: 'Sediu / adresă de corespondență (obligatoriu pentru PFA și societate)',
                  type: 'textarea',
                  admin: { description: 'Pentru persoană fizică este opțională: emailul de mai jos e suficient ca date de contact.' },
                },
                { name: 'privacyEmail', label: 'Email pentru date personale și cereri (obligatoriu)', type: 'email' },
                {
                  name: 'hostingProvider',
                  label: 'Furnizor de găzduire (obligatoriu, denumire + țară)',
                  type: 'text',
                  admin: { description: 'Ex. „Hetzner Online GmbH (Germania)”. Verifică unde sunt serverele și backup-urile.' },
                },
                { name: 'emailProvider', label: 'Furnizor de email (SMTP)', type: 'text', admin: { description: 'Ex. „Brevo (Franța)”. Gol = nu se trimit emailuri.' } },
                {
                  name: 'outsideEEA',
                  label: 'Unele date se stochează sau se transmit în afara SEE',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Bifează dacă găzduirea, emailul sau backup-urile sunt în afara Spațiului Economic European (ex. SUA).' },
                },
                {
                  name: 'transferSafeguards',
                  label: 'Garanții pentru transferul în afara SEE',
                  type: 'textarea',
                  admin: {
                    condition: (_, s) => Boolean(s?.outsideEEA),
                    description: 'Ex. „Clauze contractuale standard ale Comisiei Europene” sau „EU-US Data Privacy Framework”.',
                  },
                },
                { name: 'contactRetentionMonths', label: 'Păstrare solicitări de contact (luni)', type: 'number', min: 1, max: 60, defaultValue: 12, required: true },
                {
                  name: 'feedbackRetentionMonths',
                  label: 'Păstrare păreri neaprobate / respinse (luni)',
                  type: 'number',
                  min: 1,
                  max: 36,
                  defaultValue: 6,
                  required: true,
                },
                { name: 'updatedOn', label: 'Data ultimei actualizări a documentelor legale', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
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
