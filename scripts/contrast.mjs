// Verifică raporturile de contrast WCAG 2.x pentru perechile de culori folosite în design system.
const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const pairs = [
  // Tema deschisă cu hero 3D soft blue — docs/DESIGN_SYSTEM.md, decizia 0008
  ['text-primary (negru) pe background', '#0B0B0C', '#F4F7FB', 4.5],
  ['text-primary pe panel (alb)', '#0B0B0C', '#FFFFFF', 4.5],
  ['text-primary pe soft blue (stratul 3)', '#0B0B0C', '#CFDFF1', 4.5],
  ['text-secondary pe background', '#4B5565', '#F4F7FB', 4.5],
  ['text-secondary pe soft blue', '#4B5565', '#DCE8F5', 4.5],
  ['text articol pe background', '#1F2530', '#F4F7FB', 4.5],
  ['navy (linkuri articol) pe background', '#0F1B33', '#F4F7FB', 4.5],
  ['coral-text (etichete) pe background', '#B83C22', '#F4F7FB', 4.5],
  ['coral-text pe panel', '#B83C22', '#FFFFFF', 4.5],
  ['negru pe coral (CTA)', '#0B0B0C', '#FF6B4A', 4.5],
  ['negru pe coral hover', '#0B0B0C', '#FF8466', 4.5],
  ['focus pe background (non-text 3:1)', '#1D5FD1', '#F4F7FB', 3],
  ['focus pe soft blue', '#1D5FD1', '#DCE8F5', 3],
  ['control-border pe panel (non-text 3:1)', '#6B7689', '#FFFFFF', 3],
  ['control-border pe background', '#6B7689', '#F4F7FB', 3],
  ['coral ca text pe deschis (insuficient → se folosește coral-text)', '#FF6B4A', '#F4F7FB', 4.5],
  ['alb pe coral (insuficient → CTA folosește text negru)', '#FFFFFF', '#FF6B4A', 4.5],
  // Zone navy (.on-navy / .card-navy)
  ['text pe card navy', '#F4F7FB', '#10264D', 4.5],
  ['text-secondary pe card navy', '#A9B8D0', '#10264D', 4.5],
  ['text-secondary pe navy (footer)', '#A9B8D0', '#0F1B33', 4.5],
  ['coral pe card navy (etichete)', '#FF6B4A', '#10264D', 4.5],
  ['focus coral pe navy', '#FF6B4A', '#0F1B33', 3],
  ['control-border pe card navy', '#7D879A', '#10264D', 3],
]
let fail = 0
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok && !name.includes('insuficient') && !name.includes('NU pentru')) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1 (min ${min})  ${name}`)
}
process.exit(fail ? 1 : 0)
