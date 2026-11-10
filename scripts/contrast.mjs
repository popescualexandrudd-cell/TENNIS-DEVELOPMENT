// Verifică raporturile de contrast WCAG 2.x pentru perechile de culori folosite în design system.
const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const pairs = [
  // Paleta „apus pe teren” pe fundal albicios — docs/DESIGN_SYSTEM.md, decizia 0009
  ['text-primary (negru) pe background', '#0B0B0C', '#F4F7FB', 4.5],
  ['text-primary pe panel (alb)', '#0B0B0C', '#FFFFFF', 4.5],
  ['text-primary pe albastru prăfuit', '#0B0B0C', '#D5E0EB', 4.5],
  ['text-secondary pe background', '#4B5565', '#F4F7FB', 4.5],
  ['text-secondary pe albastru prăfuit', '#4B5565', '#D5E0EB', 4.5],
  ['text articol pe background', '#1F2530', '#F4F7FB', 4.5],
  ['ardezie (linkuri articol) pe background', '#1C2633', '#F4F7FB', 4.5],
  ['coral-text (etichete) pe background', '#B4441D', '#F4F7FB', 4.5],
  ['coral-text pe panel', '#B4441D', '#FFFFFF', 4.5],
  ['negru pe portocaliu (CTA)', '#0B0B0C', '#F26A3D', 4.5],
  ['negru pe portocaliu hover', '#0B0B0C', '#F4844F', 4.5],
  ['negru pe verde WhatsApp (buton)', '#0B0B0C', '#25D366', 4.5],
  ['negru pe verde WhatsApp hover', '#0B0B0C', '#3BE07A', 4.5],
  ['focus pe background (non-text 3:1)', '#1D5FD1', '#F4F7FB', 3],
  ['focus pe albastru prăfuit', '#1D5FD1', '#D5E0EB', 3],
  ['control-border pe panel (non-text 3:1)', '#6B7689', '#FFFFFF', 3],
  ['control-border pe background', '#6B7689', '#F4F7FB', 3],
  ['portocaliu ca text pe deschis (insuficient → se folosește coral-text)', '#F26A3D', '#F4F7FB', 4.5],
  ['alb pe portocaliu (insuficient → CTA folosește text negru)', '#FFFFFF', '#F26A3D', 4.5],
  // Zone ardezie (.on-navy / .card-navy)
  ['text pe card ardezie', '#F4F7FB', '#2A3646', 4.5],
  ['text-secondary pe card ardezie', '#AEBBCB', '#2A3646', 4.5],
  ['text-secondary pe ardezie (footer)', '#AEBBCB', '#1C2633', 4.5],
  ['portocaliu deschis pe card ardezie (etichete)', '#F28A5E', '#2A3646', 4.5],
  ['focus portocaliu pe ardezie', '#F28A5E', '#1C2633', 3],
  ['control-border pe card ardezie', '#8794A6', '#2A3646', 3],
  ['negru pe portocaliu (CTA în footer)', '#0B0B0C', '#F26A3D', 4.5],
  // Footer negru (decizia 0016)
  ['text pe footer negru', '#F4F7FB', '#0B0B0C', 4.5],
  ['text-secondary pe footer negru', '#AEBBCB', '#0B0B0C', 4.5],
  ['portocaliu deschis (hover) pe footer negru', '#F28A5E', '#0B0B0C', 4.5],
  // Hero pe panou ardezie (decizia 0011): textul stă pe voalul ardezie ≥ 88%
  ['nume alb pe voalul hero (ardezie)', '#F4F7FB', '#1C2633', 4.5],
  ['ultimul cuvânt al numelui, portocaliu pe voalul hero', '#F28A5E', '#1C2633', 4.5],
  ['text alb pe voal 88% peste piersica #F6A985 (= #36363D)', '#F4F7FB', '#36363D', 4.5],
  ['portocaliu pe voal 88% peste piersica #F6A985 (= #36363D)', '#F28A5E', '#36363D', 4.5],
]
let fail = 0
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok && !name.includes('insuficient') && !name.includes('NU pentru')) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1 (min ${min})  ${name}`)
}
process.exit(fail ? 1 : 0)
