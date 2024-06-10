import {
  CountLoaderArgs,
  DataloaderArgs,
  EncodeCursorProps,
  TCursorBase,
  TCursorValueBase,
  getPaginationLimit,
  paginatedConnection,
} from './paginatedConnection'

type PaginationInput = {
  after?: string
  first?: number
}

export type MysqlPaginatedConnectionProps<
  TNode extends object,
  TCursor = { after: string },
> = {
  dataLoader: (props: DataloaderArgs<TNode, TCursor>) => Promise<{
    edges: { node: TNode; cursor: string }[]
  }>
  countLoader: (props: CountLoaderArgs<TCursor>) => Promise<number>
  pagination: PaginationInput
  paginationSafeLimit: number
}

export const mysqlPaginatedConnection = async <
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
>(
  params: MysqlPaginatedConnectionProps<TNode, TCursor>
) => {
  // Add +1 element for calculation of hasNextPage value
  const paginationSafeLimit = params.paginationSafeLimit + 1
  const first = getPaginationLimit(
    // Add +1 element for calculation of hasNextPage value
    paginationSafeLimit,
    params.pagination?.first
  )

  const paginatedConnectionResult = await paginatedConnection<TNode, TCursor>({
    ...params,
    pagination: {
      ...params.pagination,
      // Add +1 element for calculation of hasNextPage value
      first: first + 1,
    },

    paginationSafeLimit,
    encodeCursor,
    decodeCursor,
    dataLoader: async (dataloaderParams) => {
      // Execute dataloader loading with +1 element
      const dataLoaderValue = await params.dataLoader(dataloaderParams)
      return {
        edges: dataLoaderValue.edges,
        hasNextPage: dataLoaderValue.edges.length > first,
      }
    },
  })

  // Remove +1 element loaded for calculation of hasNextPage value
  const edges = paginatedConnectionResult.edges.slice(0, first)

  return {
    ...paginatedConnectionResult,
    edges,
    pageInfo: {
      ...paginatedConnectionResult.pageInfo,
      endCursor: edges[edges.length - 1]?.cursor,
    },
  }
}

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

export const decodeCursor = <TCursor = { after: string }>(cursor: string) => {
  try {
    const cursorParams = new URLSearchParams(
      Buffer.from(cursor, 'base64url').toString()
    ).entries()

    return Object.fromEntries(cursorParams) as TCursor
  } /* c8 ignore start: malformed cursors simply return first page */ catch (err) {
    return {} as TCursor
    /* c8 ignore end */
  }
}
