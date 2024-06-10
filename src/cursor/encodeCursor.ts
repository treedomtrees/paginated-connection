import { EncodeCursorProps, TCursorBase } from '.'

export const encodeCursor = <TNode, TCursor extends TCursorBase>({
  node,
  getCursor,
}: EncodeCursorProps<TNode, TCursor>) => {
  const cursorContent = new URLSearchParams()

  const cursorValues = getCursor(node)

  for (const key in cursorValues) {
    cursorContent.append(key, cursorValues[key])
  }
  return Buffer.from(cursorContent.toString()).toString('base64url')
}
