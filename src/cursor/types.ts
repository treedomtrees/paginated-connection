export type EncodeCursorProps<TNode, TCursor = { after: string }> = {
  node: TNode
  getCursor: (node: TNode) => TCursor
}

export type EncodeCursor<TNode, TCursor> = (
  props: EncodeCursorProps<TNode, TCursor>
) => string

export type TCursorValueBase = { after: string }

export type TCursorBase = TCursorValueBase & { [key: string]: string }
