# 0005 — Analytics: Plausible, opțional (propusă, 10.11.2026)

**Context.** Măsurăm: click-uri CTA spre contact, formulare trimise cu succes, vizite pe antrenamente, trafic organic și pagini de intrare,
conversii din articole. Fără date personale în analytics.

**Propunere.** Plausible (fără cookies), integrat prin `src/components/Analytics.tsx`; inactiv până la setarea
`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Evenimente: `cta_contact_click` (clase CSS pe linkuri), `contact_submit_success` (cu tipul solicitării,
fără nume/email/mesaj). Variante: Plausible Cloud (plătit, de verificat prețul) sau Plausible Community Edition self-hosted.

**Alternative.** Umami self-hosted (echivalent); Google Analytics 4 (cookies, consimțământ, transfer de date — respins pentru v1).

**De decis de Daniel.** Activare da/nu; cloud vs. self-hosted; costul acceptat.
