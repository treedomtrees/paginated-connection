import {
  DataloaderArgs,
  EncodeCursorProps,
  paginatedConnection,
} from './paginatedConnection'

type PaginationInput = {
  after?: string
  first?: number
}

export type MongoDbPaginatedConnectionProps<TNode> = {
  dataLoader: (props: DataloaderArgs<TNode>) => Promise<{
    edges: { node: TNode; cursor: string }[]
    hasNextPage: boolean
  }>
  countLoader: (props: PaginationInput) => Promise<number>
  pagination: PaginationInput
  paginationSafeLimit: number
}

export const mongoDbPaginatedConnection = async <TNode = unknown>(
  params: MongoDbPaginatedConnectionProps<TNode>
) => {
  return paginatedConnection<TNode, PaginationInput>({
    ...params,
    encodeCursor,
    decodeCursor,
  })
}

export const encodeCursor = <TNode>({
  node,
  getAfterValue,
}: EncodeCursorProps<TNode>) => {
  const cursorContent = new URLSearchParams()

  cursorContent.append('after', getAfterValue(node))

  return Buffer.from(cursorContent.toString()).toString('base64url')
}

export const decodeCursor = (cursor: string) => {
  try {
    const cursorParams = new URLSearchParams(
      Buffer.from(cursor, 'base64url').toString()
    )

    const afterParam = cursorParams.get('after')

    return afterParam
      ? {
          after: afterParam,
        }
      : {}
  } /* c8 ignore start: malformed cursors simply return first page */ catch (err) {
    return {}
    /* c8 ignore end */
  }
}
