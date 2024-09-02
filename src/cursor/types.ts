export type CursorValueType = string | number | boolean

export type EncodeCursorProps<TNode, TCursor = { after: CursorValueType }> = {
  node: TNode
  getCursor: (node: TNode) => TCursor
}

export type EncodeCursor<TNode, TCursor> = (
  props: EncodeCursorProps<TNode, TCursor>
) => string

export type TCursorValueBase = { after: CursorValueType }

export type TCursorBase = TCursorValueBase & { [key: string]: CursorValueType }
