/** Construiește un document Lexical minimal (paragrafe și titluri) pentru seed și teste. */
type Block = string | { h2: string } | { h3: string }

export function lexical(blocks: Block[]) {
  const text = (t: string) => ({ type: 'text', text: t, version: 1, format: 0, detail: 0, mode: 'normal', style: '' })
  const children = blocks.map((b) => {
    if (typeof b === 'string') {
      return { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', children: [text(b)] }
    }
    const tag = 'h2' in b ? 'h2' : 'h3'
    return { type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0, children: [text('h2' in b ? b.h2 : b.h3)] }
  })
  return { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children } } as never
}
