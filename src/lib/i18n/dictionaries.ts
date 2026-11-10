import type { Locale } from './config'

/**
 * Texte de interfață (etichete, butoane, mesaje de formular).
 * Conținutul editorial (bio, servicii, articole) vine din CMS, nu de aici.
 */
const ro = {
  skipToContent: 'Sari la conținut',
  nav: {
    about: 'Despre',
    coaching: 'Antrenamente',
    journal: 'Jurnal',
    contact: 'Contact',
    menu: 'Meniu',
    close: 'Închide meniul',
    primary: 'Navigație principală',
    languageSwitch: 'Schimbă limba',
  },
  cta: { primary: 'Discutăm despre antrenamente', aboutLink: 'Despre mine', readStory: 'Povestea completă' },
  home: {
    about: 'Despre Daniel',
    coaching: 'Antrenamente',
    method: 'Cum lucrez',
    journal: 'Din jurnal',
    journalAll: 'Toate articolele',
    contact: 'Hai să vorbim',
  },
  coaching: {
    audience: 'Cui se adresează',
    format: 'Cum se desfășoară',
    goals: 'Ce urmărim',
    request: 'Cere informații',
    empty: 'Detaliile despre antrenamente sunt în curs de actualizare. Scrie-mi direct și îți răspund.',
  },
  journal: {
    title: 'Jurnal',
    empty: 'Primele articole apar în curând.',
    readMore: 'Citește articolul',
    publishedOn: 'Publicat',
    updatedOn: 'Actualizat',
    sources: 'Surse',
    by: 'de',
    allCategories: 'Toate',
    relatedCoaching: 'Vrei să lucrăm la asta pe teren?',
  },
  contact: {
    title: 'Contact',
    name: 'Nume',
    email: 'Email',
    type: 'Despre ce vrei să vorbim?',
    types: { coaching: 'Antrenamente', collaboration: 'Colaborare', other: 'Altceva' },
    message: 'Mesaj',
    submit: 'Trimite mesajul',
    sending: 'Se trimite…',
    success: 'Mulțumesc! Mesajul tău a fost înregistrat. Îți răspund cât pot de repede.',
    errorGeneric: 'Mesajul nu a putut fi trimis. Te rog încearcă din nou sau scrie-mi direct pe email.',
    errorRateLimit: 'Ai trimis mai multe mesaje într-un timp scurt. Te rog încearcă din nou peste câteva minute.',
    errorValidation: 'Verifică câmpurile marcate.',
    privacyNote: 'Folosesc datele trimise doar pentru a-ți răspunde. Detalii în',
    privacyLink: 'politica de confidențialitate',
    directChannels: 'Sau direct',
    required: 'obligatoriu',
    fieldErrors: {
      name: 'Scrie numele tău (2–120 de caractere).',
      email: 'Scrie o adresă de email validă.',
      type: 'Alege tipul solicitării.',
      message: 'Scrie un mesaj de cel puțin 10 caractere.',
    },
  },
  footer: { navigation: 'Navigație', social: 'Social media', legal: 'Informații', privacy: 'Confidențialitate' },
  notFound: { title: 'Pagina nu există', body: 'Pagina căutată nu există sau a fost mutată.', back: 'Înapoi la pagina principală' },
  breadcrumbHome: 'Acasă',
}

type Dictionary = typeof ro

const en: Dictionary = {
  skipToContent: 'Skip to content',
  nav: {
    about: 'About',
    coaching: 'Coaching',
    journal: 'Journal',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close menu',
    primary: 'Main navigation',
    languageSwitch: 'Change language',
  },
  cta: { primary: "Let's talk about coaching", aboutLink: 'About me', readStory: 'The full story' },
  home: {
    about: 'About Daniel',
    coaching: 'Coaching',
    method: 'How I work',
    journal: 'From the journal',
    journalAll: 'All articles',
    contact: "Let's talk",
  },
  coaching: {
    audience: 'Who it is for',
    format: 'How it works',
    goals: 'What we work towards',
    request: 'Ask for details',
    empty: 'Coaching details are being updated. Write to me directly and I will get back to you.',
  },
  journal: {
    title: 'Journal',
    empty: 'The first articles are coming soon.',
    readMore: 'Read the article',
    publishedOn: 'Published',
    updatedOn: 'Updated',
    sources: 'Sources',
    by: 'by',
    allCategories: 'All',
    relatedCoaching: 'Want to work on this on court?',
  },
  contact: {
    title: 'Contact',
    name: 'Name',
    email: 'Email',
    type: 'What would you like to talk about?',
    types: { coaching: 'Coaching', collaboration: 'Collaboration', other: 'Something else' },
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending…',
    success: 'Thank you! Your message has been received. I will reply as soon as I can.',
    errorGeneric: 'Your message could not be sent. Please try again or email me directly.',
    errorRateLimit: 'You sent several messages in a short time. Please try again in a few minutes.',
    errorValidation: 'Please check the highlighted fields.',
    privacyNote: 'I only use the data you send to reply to you. Details in the',
    privacyLink: 'privacy policy',
    directChannels: 'Or directly',
    required: 'required',
    fieldErrors: {
      name: 'Enter your name (2–120 characters).',
      email: 'Enter a valid email address.',
      type: 'Choose a request type.',
      message: 'Write a message of at least 10 characters.',
    },
  },
  footer: { navigation: 'Navigation', social: 'Social media', legal: 'Information', privacy: 'Privacy' },
  notFound: { title: 'Page not found', body: 'The page you are looking for does not exist or has moved.', back: 'Back to the homepage' },
  breadcrumbHome: 'Home',
}

const dictionaries: Record<Locale, Dictionary> = { ro, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
export type { Dictionary }
