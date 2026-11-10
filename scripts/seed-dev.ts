/**
 * Seed NUMAI pentru dezvoltare locală. Populează baza cu:
 *  - un cont admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD din .env);
 *  - textele PROPUSE în brief (hero, „Cum lucrez”), marcate „de validat” în titlul intern;
 *  - conținut demonstrativ marcat explicit „[EXEMPLU]”, ca să se vadă layoutul secțiunilor;
 *  - media demonstrative (Mixkit, licență gratuită — scripts/seed-assets/demo-media/LICENSES.md), creditate pe site.
 * Refuză să ruleze în producție. Nu folosi aceste date pe site-ul public.
 */
import 'dotenv/config'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import path from 'path'
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
      // Cifre confirmate de Daniel (10.11.2026) — nu mai sunt substituente.
      facts: [
        { value: '12', label: 'Ani de experiență ca jucător' },
        { value: '5', label: 'Ani de antrenorat' },
        { value: '200+', label: 'Sportivi la inițiere' },
        { value: '20+', label: 'Jucători de competiție antrenați' },
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

  await seedDemoMedia(payload, ctx)

  console.log('Seed local finalizat.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

type Payload = Awaited<ReturnType<typeof getPayload>>
const ASSETS = path.resolve('scripts/seed-assets/demo-media')
const CREDIT = 'Mixkit · material demonstrativ'

/** Încarcă (o singură dată) media demonstrative și le leagă de secțiunile de exemplu. */
async function seedDemoMedia(payload: Payload, ctx: { disableRevalidate: boolean }) {
  if (!existsSync(ASSETS)) return
  const upload = async (file: string, alt: string, poster?: number) => {
    // Imaginile se convertesc în .webp la încărcare, deci căutăm după numele de bază („nume.”), nu după extensie.
    const base = file.replace(/\.[^.]+$/, '.')
    const found = await payload.find({ collection: 'media', where: { filename: { like: base } }, limit: 1 })
    if (found.docs[0]) return found.docs[0].id
    const doc = await payload.create({
      collection: 'media',
      locale: 'ro',
      context: ctx,
      filePath: path.join(ASSETS, file),
      data: {
        alt,
        credit: CREDIT,
        rights: 'licensed',
        rightsNote: 'Mixkit Stock Video Free License — vezi scripts/seed-assets/demo-media/LICENSES.md. A se înlocui înainte de lansare.',
        ...(poster ? { poster } : {}),
      },
    })
    return doc.id
  }
  const video = async (name: string, alt: string) => upload(`${name}.mp4`, alt, await upload(`${name}-poster.jpg`, alt))

  const serveVideo = await video('serviciu-mixkit-878', 'Jucător văzut din spate, pregătind serviciul pe un teren în aer liber')
  const aerialServe = await video('serva-aerian-mixkit-879', 'Jucător care servește, filmat de sus, pe un teren albastru')
  const stills = [
    await upload('asteptare-mixkit-878.jpg', 'Jucător văzut din spate, în așteptare la linia de fund'),
    await upload('lovitura-aerian-mixkit-879.jpg', 'Teren de tenis văzut de sus, cu jucătorul la linia de fund'),
    await upload('serva-sus-mixkit-878.jpg', 'Jucător văzut din spate, cu brațul ridicat la serviciu'),
  ]
  const rally = await upload('schimb-aerian-mixkit-880.jpg', 'Teren de tenis văzut de sus, în timpul unui schimb de mingi')

  const home = (await payload.find({ collection: 'pages', where: { key: { equals: 'home' } }, limit: 1, locale: 'ro' })).docs[0]
  if (home?.home?.method) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'ro',
      context: ctx,
      data: {
        // Hero fără media demonstrativă (cerut de Daniel): rămân straturile 3D până la o fotografie reală.
        image: null,
        home: { ...home.home, method: home.home.method.map((step, i) => ({ ...step, media: stills[i] ?? null })) },
        _status: 'published',
      },
    })
  }
  const services = await payload.find({ collection: 'coaching-services', sort: 'order', limit: 3, locale: 'ro' })
  const serviceMedia = [serveVideo, aerialServe, rally]
  for (const [i, s] of services.docs.entries()) {
    if (!s.image) await payload.update({ collection: 'coaching-services', id: s.id, locale: 'ro', context: ctx, data: { image: serviceMedia[i] } })
  }
  const articles = await payload.find({ collection: 'articles', limit: 3, sort: 'createdAt' })
  const covers = [stills[2], rally, stills[0]]
  for (const [i, a] of articles.docs.entries()) {
    if (!a.coverImage) await payload.update({ collection: 'articles', id: a.id, context: ctx, data: { coverImage: covers[i] } })
  }
}
