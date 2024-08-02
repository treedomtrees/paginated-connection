import { EncodeCursorProps, TCursorBase } from '.'

export const encodeCursor = <TNode, TCursor extends TCursorBase>({
  node,
  getCursor,
}: EncodeCursorProps<TNode, TCursor>) => {
  const cursorContent = new URLSearchParams()

  const cursorValues = getCursor(node)

  for (const key in cursorValues) {
    // Have to format the string in order to be able to parse in decoding function
    cursorContent.append(key, JSON.stringify(cursorValues[key]))
  }
  return Buffer.from(cursorContent.toString()).toString('base64url')
}
