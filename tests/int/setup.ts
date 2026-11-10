import 'dotenv/config'

// Testele de integrare folosesc EXCLUSIV o bază de date de test, niciodată producția.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://dp:dp_local_dev@localhost:5432/dp_web_test'
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret'
process.env.CONTACT_HASH_SECRET = 'test-hash-secret'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
delete process.env.SMTP_HOST

if (/prod/i.test(process.env.DATABASE_URL) || process.env.SITE_ENV === 'production') {
  throw new Error('Refuz să rulez testele pe o bază de date care pare de producție.')
}
