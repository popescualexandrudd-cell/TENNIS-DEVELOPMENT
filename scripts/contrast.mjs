// Verifică raporturile de contrast WCAG 2.x pentru perechile de culori folosite în design system.
const hex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
const pairs = [
  // Paleta v2 — docs/DESIGN_SYSTEM.md, decizia 0006
  ['text-primary (negru) pe background', '#0B0B0C', '#F4F7FB', 4.5],
  ['text-primary pe surface', '#0B0B0C', '#FFFFFF', 4.5],
  ['text-secondary pe background', '#4B5565', '#F4F7FB', 4.5],
  ['text-secondary pe surface', '#4B5565', '#FFFFFF', 4.5],
  ['text-secondary pe soft-blue', '#4B5565', '#DCE8F5', 4.5],
  ['navy pe soft-blue (titluri)', '#0F1B33', '#DCE8F5', 4.5],
  ['navy pe background (linkuri)', '#0F1B33', '#F4F7FB', 4.5],
  ['alb pe navy (header, hero)', '#FFFFFF', '#0F1B33', 4.5],
  ['on-dark-muted pe navy', '#A9B8D0', '#0F1B33', 4.5],
  ['on-dark-muted pe negru (footer)', '#A9B8D0', '#0B0B0C', 4.5],
  ['negru pe coral (CTA)', '#0B0B0C', '#FF6B4A', 4.5],
  ['negru pe coral hover', '#0B0B0C', '#FF8466', 4.5],
  ['coral pe navy (eyebrow pe hero)', '#FF6B4A', '#0F1B33', 4.5],
  ['coral-text pe background (etichete)', '#B83C22', '#F4F7FB', 4.5],
  ['coral-text pe surface', '#B83C22', '#FFFFFF', 4.5],
  ['alb pe coral (insuficient → CTA folosește text negru)', '#FFFFFF', '#FF6B4A', 4.5],
  ['coral ca text pe background (insuficient → se folosește coral-text)', '#FF6B4A', '#F4F7FB', 4.5],
  ['focus pe background (non-text 3:1)', '#1D5FD1', '#F4F7FB', 3],
  ['focus pe surface', '#1D5FD1', '#FFFFFF', 3],
  ['focus coral pe navy', '#FF6B4A', '#0F1B33', 3],
  ['focus coral pe negru', '#FF6B4A', '#0B0B0C', 3],
  ['control-border pe surface (non-text 3:1)', '#6B7689', '#FFFFFF', 3],
  ['control-border pe background', '#6B7689', '#F4F7FB', 3],
  ['border decorativ pe background (NU pentru controale)', '#D5DEEA', '#F4F7FB', 3],
]
let fail = 0
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok && !name.includes('insuficient') && !name.includes('NU pentru')) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1 (min ${min})  ${name}`)
}
process.exit(fail ? 1 : 0)
