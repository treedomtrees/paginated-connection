import {
  TCursorBase,
  TCursorValueBase,
  encodeCursor,
  decodeCursor,
} from './cursor'
import {
  CountLoaderProps,
  DataloaderProps,
  PaginationInput,
  getPaginationLimit,
  paginatedConnection,
} from './paginatedConnection'

export type MysqlPaginatedConnectionProps<
  TNode extends object,
  TCursor = { after: string },
> = {
  dataLoader: (props: DataloaderProps<TNode, TCursor>) => Promise<{
    edges: { node: TNode; cursor: string }[]
  }>
  countLoader: (props: CountLoaderProps<TCursor>) => Promise<number>
  pagination: PaginationInput
  paginationSafeLimit: number
}

export const mysqlPaginatedConnection = async <
  TNode extends object,
  TCursor extends TCursorBase = TCursorValueBase,
>(
  props: MysqlPaginatedConnectionProps<TNode, TCursor>
) => {
  // Add +1 element for calculation of hasNextPage value
  const paginationSafeLimit = props.paginationSafeLimit + 1
  const first = getPaginationLimit(
    // Add +1 element for calculation of hasNextPage value
    paginationSafeLimit,
    props.pagination?.first
  )

  const paginatedConnectionResult = await paginatedConnection<TNode, TCursor>({
    ...props,
    pagination: {
      ...props.pagination,
      // Add +1 element for calculation of hasNextPage value
      first: first + 1,
    },

    paginationSafeLimit,
    encodeCursor,
    decodeCursor,
    dataLoader: async (dataloaderParams) => {
      // Execute dataloader loading with +1 element
      const dataLoaderValue = await props.dataLoader(dataloaderParams)
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
