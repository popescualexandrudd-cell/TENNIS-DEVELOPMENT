import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import { pagePath } from '@/lib/i18n/routes'
import { MailLink, Section, V } from './parts'

/*
 * Textele legale în română. Descriu EXACT ce face codul site-ului (vezi docs/decisions/0013):
 * formularele din src/features/contact și src/features/testimonials, hash-ul IP din rate-limit.ts,
 * cookie-urile Payload/Next doar în administrare, analytics Plausible doar dacă e configurat.
 * Orice schimbare a prelucrărilor din cod trebuie reflectată aici.
 */

type Props = { settings: SiteSetting; analyticsEnabled: boolean }

const entityLabel = { individual: 'persoană fizică', pfa: 'PFA / întreprindere individuală', company: 'societate' } as const

function Operator({ settings }: { settings: SiteSetting }) {
  const l = settings.legal
  const business = l?.entityType && l.entityType !== 'individual'
  return (
    <ul>
      <li>
        <strong>Operator:</strong> <V value={l?.legalName} label="denumire / nume complet" /> ({entityLabel[l?.entityType ?? 'individual']})
      </li>
      {business ? (
        <>
          <li>
            <strong>CUI / CIF:</strong> <V value={l?.taxId} label="CUI" />
          </li>
          {l?.tradeRegister ? (
            <li>
              <strong>Nr. Registrul Comerțului:</strong> {l.tradeRegister}
            </li>
          ) : null}
        </>
      ) : null}
      {business || l?.address ? (
        <li>
          <strong>{business ? 'Sediu' : 'Adresă de corespondență'}:</strong> <V value={l?.address} label="adresă" />
        </li>
      ) : null}
      <li>
        <strong>Email pentru date personale:</strong> <MailLink email={l?.privacyEmail} />
      </li>
    </ul>
  )
}

export function PrivacyRo({ settings, analyticsEnabled }: Props) {
  const l = settings.legal
  const contactMonths = l?.contactRetentionMonths ?? 12
  const feedbackMonths = l?.feedbackRetentionMonths ?? 6
  return (
    <>
      <p>
        Această informare explică ce date personale se prelucrează prin acest site, de ce, cât timp și ce drepturi ai, conform
        Regulamentului (UE) 2016/679 („GDPR”) și Legii nr. 190/2018. Pe scurt: colectez doar ce îmi trimiți prin formulare, nu folosesc
        cookie-uri de urmărire, nu vând și nu închiriez datele și nu le folosesc pentru marketing.
      </p>

      <Section id="operator" title="1. Cine sunt și cum mă contactezi">
        <Operator settings={settings} />
        <p>Nu am numit un responsabil cu protecția datelor (DPO); nu este obligatoriu pentru activitatea acestui site. Pentru orice întrebare scrie-mi la adresa de mai sus.</p>
      </Section>

      <Section id="contact-form" title="2. Formularul de contact">
        <ul>
          <li>
            <strong>Date:</strong> nume, adresă de email, tipul solicitării, mesajul și limba formularului; data trimiterii.
          </li>
          <li>
            <strong>Scop:</strong> să îți răspund și să discutăm despre antrenamente, o colaborare sau întrebarea ta.
          </li>
          <li>
            <strong>Temei:</strong> demersuri făcute la cererea ta înainte de o eventuală înțelegere (art. 6 alin. (1) lit. b GDPR) și interesul
            meu legitim de a răspunde mesajelor primite (art. 6 alin. (1) lit. f).
          </li>
          <li>
            <strong>Durată:</strong> {contactMonths} luni de la ultima actualizare a solicitării, apoi se șterge automat. Dacă ajungem la o
            înțelegere, datele necesare pot fi păstrate cât cere legea (de ex. evidențe financiare).
          </li>
          <li>
            <strong>Furnizarea datelor</strong> este voluntară; fără nume, email și mesaj nu îți pot răspunde.
          </li>
        </ul>
      </Section>

      <Section id="feedback-form" title="3. Formularul „Lasă o părere”">
        <ul>
          <li>
            <strong>Date:</strong> numele așa cum vrei să apară, contextul (opțional), părerea, emailul (opțional, nu se publică), acordul tău
            de publicare și textul exact al acordului, limba formularului și data.
          </li>
          <li>
            <strong>Scop:</strong> să public pe site părerea ta despre antrenamente, după ce o citesc. Emailul îl folosesc doar dacă trebuie să
            te contactez în legătură cu părerea.
          </li>
          <li>
            <strong>Temei:</strong> consimțământul tău (art. 6 alin. (1) lit. a GDPR), dat prin bifa din formular. Îl poți retrage oricând
            scriindu-mi; retragerea nu afectează publicarea făcută până atunci.
          </li>
          <li>
            <strong>Durată:</strong> o părere aprobată rămâne publicată până îți retragi acordul sau până o scot eu. O părere neaprobată sau
            respinsă se șterge automat după {feedbackMonths} luni.
          </li>
          <li>
            <strong>Ce apare public:</strong> numai numele, contextul și părerea. Emailul nu este afișat niciodată.
          </li>
        </ul>
      </Section>

      <Section id="technical" title="4. Date tehnice și protecția împotriva abuzurilor">
        <p>
          Ca să limitez mesajele trimise automat (spam), la fiecare trimitere de formular calculez din adresa ta IP un cod ireversibil (hash
          HMAC cu o cheie secretă), pe care îl păstrez împreună cu mesajul, pe aceeași durată. <strong>Adresa IP în sine nu este salvată</strong>{' '}
          în baza de date a site-ului. Temei: interesul legitim de a proteja site-ul (art. 6 alin. (1) lit. f).
        </p>
        <p>
          Furnizorul de găzduire poate păstra, separat, jurnale tehnice ale serverului (adresă IP, dată, pagină accesată, browser), pentru
          funcționare și securitate, pe perioada stabilită de politica sa. Temei: interesul legitim privind securitatea serviciului.
        </p>
        {analyticsEnabled ? (
          <p>
            Pentru statistici de vizitare folosesc Plausible Analytics, un instrument fără cookie-uri, care nu stochează adrese IP și oferă
            doar cifre agregate (pagini vizitate, țară, tip de dispozitiv). Datele din formulare nu sunt trimise niciodată către statistici.
          </p>
        ) : (
          <p>Site-ul nu folosește în prezent instrumente de statistici sau de urmărire a vizitatorilor.</p>
        )}
      </Section>

      <Section id="recipients" title="5. Cine mai are acces la date">
        <ul>
          <li>
            Furnizorul de găzduire, care stochează site-ul și baza de date: <V value={l?.hostingProvider} label="furnizor de găzduire" />.
          </li>
          {l?.emailProvider ? <li>Furnizorul de email, prin care primesc notificarea despre un mesaj nou: {l.emailProvider}.</li> : null}
          <li>Autorități publice, numai dacă legea mă obligă.</li>
        </ul>
        <p>Acești furnizori prelucrează datele doar pe baza instrucțiunilor mele, în calitate de persoane împuternicite.</p>
        {l?.outsideEEA ? (
          <p>
            Unele date sunt stocate sau transmise în afara Spațiului Economic European. Transferul are loc cu următoarele garanții:{' '}
            <V value={l?.transferSafeguards} label="garanții pentru transfer" />.
          </p>
        ) : (
          <p>Datele sunt stocate în Spațiul Economic European și nu sunt transferate în afara lui.</p>
        )}
      </Section>

      <Section id="rights" title="6. Drepturile tale">
        <p>
          Ai dreptul să ceri acces la datele tale, rectificarea sau ștergerea lor, restricționarea prelucrării, portabilitatea datelor și să te
          opui prelucrării bazate pe interes legitim. Când prelucrarea se bazează pe consimțământ, îl poți retrage oricând. Scrie-mi la{' '}
          <MailLink email={l?.privacyEmail} />; îți răspund în cel mult o lună (termen care se poate prelungi cu două luni pentru cereri
          complexe, cu informarea ta).
        </p>
        <p>
          Poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral.
          Gheorghe Magheru nr. 28–30, sector 1, București,{' '}
          <a href="https://www.dataprotection.ro" rel="noopener" target="_blank">
            www.dataprotection.ro
          </a>
          .
        </p>
        <p>Nu iau decizii automate și nu fac profilare pe baza datelor tale.</p>
      </Section>

      <Section id="minors" title="7. Copii și adolescenți">
        <p>
          Lucrez și cu sportivi la inițiere, dintre care mulți sunt copii. Dacă ai sub 16 ani, roagă un părinte sau tutore să trimită mesajul
          ori părerea în numele tău. Formularul de păreri cere confirmarea vârstei sau a acordului părintelui.
        </p>
      </Section>

      <Section id="security" title="8. Cum protejez datele">
        <p>
          Site-ul folosește conexiune criptată (HTTPS) și antete de securitate. Administrarea este accesibilă doar cu cont și parolă, cu
          blocare temporară după încercări repetate greșite. Mesajele și părerile pot fi văzute doar din administrare; publicul vede doar
          părerile aprobate. Copiile de siguranță sunt păstrate cu acces restricționat.
        </p>
      </Section>

      <Section id="cookies" title="9. Cookie-uri">
        <p>
          Site-ul public nu setează cookie-uri. Detalii în <Link href={pagePath('ro', 'cookies')}>politica de cookie-uri</Link>.
        </p>
      </Section>

      <Section id="changes" title="10. Modificări">
        <p>
          Când se schimbă felul în care sunt prelucrate datele, actualizez această pagină și data de mai jos. Ultima actualizare:{' '}
          <V value={l?.updatedOn ? new Date(l.updatedOn).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : null} label="data actualizării" />.
        </p>
      </Section>
    </>
  )
}

export function CookiesRo({ settings, analyticsEnabled }: Props) {
  const l = settings.legal
  return (
    <>
      <p>
        Cookie-urile sunt fișiere mici pe care un site le poate salva în browserul tău. Legea (Legea nr. 506/2004 și GDPR) cere acordul tău
        pentru cookie-urile care nu sunt strict necesare.
      </p>

      <Section id="public" title="1. Pe site-ul public: niciun cookie">
        <p>
          Când citești site-ul, trimiți un mesaj sau o părere, <strong>nu se setează niciun cookie</strong> și nu se folosește stocarea locală a
          browserului. De aceea nu vezi un banner de acord: nu există nimic pentru care să-ți cer acordul.
        </p>
        <ul>
          <li>Fonturile și imaginile sunt găzduite pe același server, nu la terți (fără Google Fonts, fără CDN-uri externe).</li>
          <li>Clipurile video sunt găzduite pe site; nu folosesc playere YouTube sau Vimeo.</li>
          <li>Linkurile către rețelele sociale sunt simple linkuri: nu încarcă butoane sau scripturi ale acelor rețele.</li>
          <li>
            {analyticsEnabled
              ? 'Statisticile de vizitare (Plausible Analytics) funcționează fără cookie-uri și fără stocare în browser.'
              : 'Nu folosesc instrumente de statistici sau de publicitate.'}
          </li>
        </ul>
      </Section>

      <Section id="admin" title="2. Doar în administrare">
        <p>Următoarele cookie-uri strict necesare apar numai pentru persoanele care se autentifică în administrarea site-ului:</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Nume</th>
                <th scope="col">Scop</th>
                <th scope="col">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>payload-token</code>
                </td>
                <td>Menține autentificarea în administrare (HttpOnly, nu poate fi citit de scripturi).</td>
                <td>8 ore</td>
              </tr>
              <tr>
                <td>
                  <code>__prerender_bypass</code>
                </td>
                <td>Previzualizarea privată a unui articol nepublicat.</td>
                <td>Sesiune</td>
              </tr>
              <tr>
                <td>
                  <code>payload-*</code> (preferințe)
                </td>
                <td>Preferințe ale interfeței de administrare (de ex. limba sau tema), dacă le schimbi.</td>
                <td>Până la ștergere</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="control" title="3. Cum controlezi cookie-urile">
        <p>
          Poți șterge sau bloca oricând cookie-urile din setările browserului. Pe site-ul public nu se va schimba nimic, pentru că acesta nu
          folosește cookie-uri.
        </p>
        <p>
          Întrebări: <MailLink email={l?.privacyEmail} />. Vezi și <Link href={pagePath('ro', 'privacy')}>politica de confidențialitate</Link>.
        </p>
      </Section>
    </>
  )
}

export function TermsRo({ settings }: Props) {
  const l = settings.legal
  return (
    <>
      <Section id="about-site" title="1. Informații despre site și operator">
        <p>
          Site-ul prezintă activitatea mea de antrenor de tenis, un jurnal cu articole și formulare de contact și de păreri. Date de
          identificare (Legea nr. 365/2002 privind comerțul electronic):
        </p>
        <Operator settings={settings} />
      </Section>

      <Section id="use" title="2. Folosirea site-ului">
        <p>
          Prin folosirea site-ului accepți acești termeni. Site-ul are scop informativ: nu vinde produse sau servicii online. Detaliile unui
          antrenament (program, loc, preț, condiții) se stabilesc direct cu mine, înainte de începere.
        </p>
        <p>
          Nu este permisă folosirea site-ului pentru a trimite mesaje nesolicitate (spam), pentru a încerca accesul neautorizat la administrare
          sau la date, pentru a perturba funcționarea serverului ori pentru colectarea automată masivă a conținutului.
        </p>
      </Section>

      <Section id="content" title="3. Conținut și drepturi de autor">
        <p>
          Textele, fotografiile, clipurile și elementele de identitate vizuală aparțin operatorului sau sunt folosite cu licență, caz în care
          sursa este indicată (de ex. „Mixkit · material demonstrativ”). Poți cita fragmente scurte, cu menționarea sursei și link către pagină;
          reproducerea integrală sau folosirea comercială necesită acordul meu scris.
        </p>
        <p>
          Articolele din jurnal oferă informații generale despre tenis și pregătire. Nu înlocuiesc o evaluare individuală pe teren și nici
          sfatul unui medic; consultă un medic înainte de a începe un program de efort, mai ales după o accidentare.
        </p>
      </Section>

      <Section id="feedback" title="4. Părerile trimise de sportivi">
        <p>Trimițând o părere, confirmi că:</p>
        <ul>
          <li>descrie experiența ta reală la antrenamente și îți aparține;</li>
          <li>ai cel puțin 16 ani sau o trimiți cu acordul părintelui ori al tutorelui;</li>
          <li>nu conține date personale ale altor persoane, reclame, linkuri sau conținut ilegal ori jignitor;</li>
          <li>
            îmi dai, gratuit și neexclusiv, dreptul de a o publica pe acest site, cu numele și contextul indicate, putând corecta greșelile de
            tastare fără a-i schimba sensul.
          </li>
        </ul>
        <p>
          Citesc fiecare părere înainte de publicare și pot decide să nu o public. Poți cere oricând retragerea ei la <MailLink email={l?.privacyEmail} />.
        </p>
      </Section>

      <Section id="links" title="5. Linkuri externe">
        <p>Site-ul poate conține linkuri către alte site-uri (de ex. surse ale articolelor sau rețele sociale). Nu răspund pentru conținutul sau politicile acestora.</p>
      </Section>

      <Section id="liability" title="6. Răspundere">
        <p>
          Mă străduiesc ca informațiile de pe site să fie corecte și actuale, dar ele pot conține erori sau pot deveni depășite. Site-ul poate fi
          temporar indisponibil pentru întreținere sau din motive tehnice. În limitele permise de lege, nu răspund pentru pagube indirecte
          rezultate din folosirea informațiilor generale publicate.
        </p>
      </Section>

      <Section id="law" title="7. Legea aplicabilă și litigii">
        <p>
          Acești termeni sunt guvernați de legea română. Orice neînțelegere încerc să o rezolv amiabil, la <MailLink email={l?.privacyEmail} />;
          dacă nu reușim, competența revine instanțelor din România. Dacă ești consumator, poți apela și la Autoritatea Națională pentru
          Protecția Consumatorilor (
          <a href="https://anpc.ro" rel="noopener" target="_blank">
            anpc.ro
          </a>
          ).
        </p>
      </Section>

      <Section id="terms-changes" title="8. Modificări">
        <p>
          Pot actualiza acești termeni; versiunea în vigoare este cea publicată aici. Vezi și{' '}
          <Link href={pagePath('ro', 'privacy')}>politica de confidențialitate</Link> și <Link href={pagePath('ro', 'cookies')}>politica de cookie-uri</Link>.
        </p>
      </Section>
    </>
  )
}
