export type EncodeCursorProps<TNode, TCursor = { after: string }> = {
  node: TNode
  getCursor: (node: TNode) => TCursor
}

type EncodeCursor<TNode, TCursor> = (
  props: EncodeCursorProps<TNode, TCursor>
) => string

export type DataloaderArgs<TNode, TCursor = { after: string }> = {
  cursor?: TCursor
  first: number
  encodeCursor: EncodeCursor<TNode, TCursor>
}

export type CountLoaderArgs<TCursor = { after: string }> = { cursor?: TCursor }

export type PaginationInput = {
  after?: string
  first?: number
}

export type TCursorValueBase = { after: string }

export type TCursorBase = TCursorValueBase & { [key: string]: string }

export type PaginatedConnectionProps<
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
> = {
  pagination: PaginationInput
  paginationSafeLimit: number
  dataLoader: (props: DataloaderArgs<TNode, TCursor>) => Promise<{
    edges: { node: TNode; cursor: string }[]
    hasNextPage: boolean
  }>
  encodeCursor: EncodeCursor<TNode, TCursor>
  decodeCursor: (cursor: string) => TCursor
  countLoader: (props: CountLoaderArgs<TCursor>) => Promise<number>
}

/**
 * Handles pagination to offset-style ordering returning Connection-style GQL result
 */
export const paginatedConnection = async <
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
>(
  props: PaginatedConnectionProps<TNode, TCursor>
) => {
  const { first, after } = props.pagination ?? {}

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
    totalCount: async () => props.countLoader({ cursor: decodedCursor }),
    pageInfo: {
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage,
    },
    edges,
  }
}

export const getPaginationLimit = (
  paginationSafeLimit: number,
  limit?: number
) => {
  if (!limit) {
    return paginationSafeLimit
  }
  return limit > paginationSafeLimit ? paginationSafeLimit : limit
}
