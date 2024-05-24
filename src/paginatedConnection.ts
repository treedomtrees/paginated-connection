export type EncodeCursorProps<TNode> = {
  node: TNode
  getAfterValue: (node: TNode) => string
}

export type DataloaderArgs<TNode> = {
  after?: string
  first: number
  encodeCursor: (props: EncodeCursorProps<TNode>) => string
}

export type PaginationInput = {
  after?: string
  first?: number
}

export type PaginatedConnectionProps<
  TNode,
  TCursor = Record<string, unknown>,
> = {
  pagination: PaginationInput
  paginationSafeLimit: number
  dataLoader: (props: DataloaderArgs<TNode> & TCursor) => Promise<{
    edges: { node: TNode; cursor: string }[]
    hasNextPage: boolean
  }>
  encodeCursor: (props: EncodeCursorProps<TNode>) => string
  decodeCursor: (cursor: string) => TCursor
  countLoader: (props: TCursor) => Promise<number>
}

/**
 * Handles pagination to offset-style ordering returning Connection-style GQL result
 */
export const paginatedConnection = async <
  TNode,
  TCursor = Record<string, unknown>,
>(
  props: PaginatedConnectionProps<TNode, TCursor>
) => {
  const { first, after } = props.pagination

  // Apply the safe limit or default when "first" is not provided
  const limit = getPaginationLimit(props.paginationSafeLimit, first)

  let decodedCursor: TCursor = {} as TCursor

  if (after) {
    decodedCursor = props.decodeCursor(after)
  }

  const { edges, hasNextPage } = await props.dataLoader({
    ...decodedCursor,
    encodeCursor: props.encodeCursor,
    first: limit,
  })

  return {
    totalCount: () => props.countLoader({ ...decodedCursor }),
    pageInfo: {
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage,
    },
    edges,
  }
}

const getPaginationLimit = (paginationSafeLimit: number, limit?: number) => {
  if (!limit) {
    return paginationSafeLimit
  }
  return limit > paginationSafeLimit ? paginationSafeLimit : limit
}
