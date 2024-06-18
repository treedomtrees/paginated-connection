import { EncodeCursor, TCursorBase, TCursorValueBase } from './cursor'

export type PaginatedConnectionEdge<TNode> = {
  node: TNode
  cursor: string
}

export type PaginatedConnectionReturnType<TNode> = Promise<{
  totalCount: () => Promise<number>
  pageInfo: {
    endCursor: string
    hasNextPage: boolean
  }
  edges: Array<PaginatedConnectionEdge<TNode>>
}>

export type CreateEdge<TNode, TCursor> = (
  node: TNode,
  getCursor: (node: TNode) => TCursor
) => PaginatedConnectionEdge<TNode>

export type DataloaderProps<TNode, TCursor = { after: string }> = {
  cursor?: TCursor
  first: number
  encodeCursor: EncodeCursor<TNode, TCursor>
  createEdge: CreateEdge<TNode, TCursor>
}

export type CountLoaderProps<TCursor = { after: string }> = { cursor?: TCursor }

export type PaginationInput = {
  after?: string
  first?: number
}

export type PaginatedConnectionProps<
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
> = {
  pagination: PaginationInput
  paginationSafeLimit: number
  dataLoader: (props: DataloaderProps<TNode, TCursor>) => Promise<{
    edges: { node: TNode; cursor: string }[]
    hasNextPage: boolean
  }>
  encodeCursor: EncodeCursor<TNode, TCursor>
  decodeCursor: (cursor: string) => TCursor
  countLoader: (props: CountLoaderProps<TCursor>) => Promise<number>
}

/**
 * Handles pagination to offset-style ordering returning Connection-style GQL result
 */
export const paginatedConnection = async <
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
>(
  props: PaginatedConnectionProps<TNode, TCursor>
): PaginatedConnectionReturnType<TNode> => {
  const { first, after } = props.pagination ?? {}

  // Apply the safe limit or default when "first" is not provided
  const limit = getPaginationLimit(props.paginationSafeLimit, first)

  let decodedCursor: TCursor = {} as TCursor

  if (after) {
    decodedCursor = props.decodeCursor(after)
  }

  const { edges, hasNextPage } = await props.dataLoader({
    cursor: decodedCursor,
    encodeCursor: props.encodeCursor,
    first: limit,
    createEdge: (node, getCursor) => {
      return {
        node,
        cursor: props.encodeCursor({
          node,
          getCursor,
        }),
      }
    },
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
