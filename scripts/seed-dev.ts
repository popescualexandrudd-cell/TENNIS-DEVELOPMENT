/**
 * Seed NUMAI pentru dezvoltare locală. Populează baza cu:
 *  - un cont admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD din .env);
 *  - textele PROPUSE în brief (hero, „Cum lucrez”), marcate „de validat” în titlul intern;
 *  - conținut demonstrativ marcat explicit „[EXEMPLU]”, ca să se vadă layoutul secțiunilor.
 * Refuză să ruleze în producție. Nu folosi aceste date pe site-ul public.
 */
import 'dotenv/config'
import { randomUUID } from 'crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { lexical } from './lexical'

if (process.env.NODE_ENV === 'production' || process.env.SITE_ENV === 'production') {
  console.error('Seed-ul de dezvoltare nu rulează în producție.')
  process.exit(1)
}

const EX = '[EXEMPLU]'

async function main() {
  const payload = await getPayload({ config })
  const ctx = { disableRevalidate: true }

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email && password) {
    const { totalDocs } = await payload.count({ collection: 'admin-users', where: { email: { equals: email } } })
    if (!totalDocs) await payload.create({ collection: 'admin-users', data: { email, password, name: 'Admin local', roles: ['admin'] }, context: ctx })
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'ro',
    context: ctx,
    data: { personName: 'Daniel Popescu', signature: 'Beyond the Game', englishEnabled: false, email: 'contact@example.test' },
  })

  const pages = await payload.find({ collection: 'pages', where: { key: { equals: 'home' } }, limit: 1 })
  const homeData = {
    key: 'home' as const,
    internalTitle: 'Homepage — texte propuse, DE VALIDAT de Daniel',
    available: true,
    title: 'Tenis. Progres construit pe teren.',
    intro:
      'Sunt Daniel Popescu. Abordarea mea pornește de la jucător, obiectivele lui și lucrurile pe care le putem îmbunătăți împreună.',
    home: {
      aboutHeading: `${EX} Titlu-afirmație scurt`,
      coachingHeading: 'Antrenamente cu obiective clare',
      facts: [
        { value: '00', label: `${EX} Ani de experiență`, note: 'De completat cu date reale' },
        { value: '00', label: `${EX} Jucători antrenați`, note: 'Doar dacă poate fi verificat' },
        { value: '00', label: `${EX} Altă cifră reală`, note: 'Sau secțiunea rămâne ascunsă' },
      ],
      testimonials: [
        { name: 'Nume Exemplu', role: `${EX} Context jucător`, quote: `${EX} Aici apare un citat real, publicat doar cu acordul scris al persoanei.`, consent: true },
      ],
      aboutText: `${EX} Aici vor sta 80–120 de cuvinte scrise sau validate de Daniel: cine este, de unde vine în tenis și ce îl interesează la fiecare jucător cu care lucrează. Textul acesta este doar un substituent pentru layout și nu descrie experiența reală.`,
      approach: [
        { title: `${EX} Jucătorul înainte de metodă`, text: 'Prima idee despre abordare, formulată de Daniel.' },
        { title: `${EX} Obiective clare`, text: 'A doua idee concretă despre felul în care lucrează.' },
        { title: `${EX} Atenție la detalii`, text: 'A treia idee, aplicabilă pe teren.' },
      ],
      method: [
        { title: 'Discutăm obiectivele', text: 'Pornim de la ce vrei să obții și de la timpul pe care îl ai la dispoziție.' },
        { title: 'Evaluăm punctul de plecare', text: 'Vedem pe teren ce funcționează deja și ce merită lucrat întâi.' },
        { title: 'Lucrăm și ajustăm', text: 'Antrenamentele se adaptează pe măsură ce apar progresul și întrebările noi.' },
      ],
      contactInvite: 'Spune-mi pe scurt ce vrei să lucrezi și îți răspund personal.',
    },
    _status: 'published' as const,
  }
  if (pages.docs[0]) await payload.update({ collection: 'pages', id: pages.docs[0].id, locale: 'ro', data: homeData, context: ctx })
  else await payload.create({ collection: 'pages', locale: 'ro', data: homeData, context: ctx })

  const { totalDocs: services } = await payload.count({ collection: 'coaching-services' })
  if (!services) {
    for (const [i, title] of ['Antrenament individual', 'Antrenament în pereche', 'Pregătire pentru competiții'].entries()) {
      await payload.create({
        collection: 'coaching-services',
        locale: 'ro',
        context: ctx,
        data: {
          title: `${EX} ${title}`,
          audience: 'Cui se adresează — de completat de Daniel.',
          format: 'Cum se desfășoară — durată, loc, frecvență, de confirmat.',
          goals: 'Ce urmărește — de completat.',
          confirmed: true,
          order: i + 1,
        },
      })
    }
  }

  const { totalDocs: cats } = await payload.count({ collection: 'categories' })
  if (!cats) {
    for (const [name, slug] of [
      ['Tehnică și tactică', 'tehnica-si-tactica'],
      ['Pregătire și progres', 'pregatire-si-progres'],
      ['Analize și observații', 'analize-si-observatii'],
    ]) {
      await payload.create({ collection: 'categories', locale: 'ro', data: { name: name!, slug: slug! }, context: ctx })
    }
  }

  const { totalDocs: articles } = await payload.count({ collection: 'articles' })
  if (!articles) {
    const category = (await payload.find({ collection: 'categories', limit: 1 })).docs[0]
    for (const n of [1, 2, 3]) {
      await payload.create({
        collection: 'articles',
        context: ctx,
        data: {
          title: `${EX} Titlu de articol demonstrativ ${n}`,
          language: 'ro',
          translationGroup: randomUUID(),
          authorName: 'Daniel Popescu',
          excerpt: 'Rezumat demonstrativ pentru verificarea layoutului. Nu este un articol real.',
          content: lexical([
            'Acesta este un paragraf demonstrativ, folosit doar pentru a verifica tipografia de lectură.',
            { h2: 'Un subtitlu' },
            'Încă un paragraf cu diacritice: ă, â, î, ș, ț — Ă, Â, Î, Ș, Ț.',
          ]),
          category: category?.id,
          workflow: 'draft',
          _status: 'published',
        },
      })
    }
  }

  console.log('Seed local finalizat.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
