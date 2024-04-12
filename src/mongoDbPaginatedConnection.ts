import { ObjectId, WithId } from 'mongodb'
import {
  DataloaderArgs,
  PaginationInput,
  paginatedConnection,
} from './paginatedConnection'

export type MongoDbPaginatedConnectionProps<TNode> = {
  dataLoader: (props: DataloaderArgs<TNode, object>) => Promise<{
    edges: { node: TNode; cursor: string }[]
    hasNextPage: boolean
  }>
  countLoader: (props: PaginationInput) => Promise<number>
  pagination: PaginationInput
  paginationSafeLimit: 10
}

export const mongoDbPaginatedConnection = async <TNode = WithId<unknown>>(
  params: MongoDbPaginatedConnectionProps<TNode>
) => {
  return paginatedConnection<TNode, PaginationInput>({
    ...params,
    // TODO use correct serialization
    encodeCursor: ({ node }) => {
      return JSON.stringify({ after: (node._id as ObjectId).toHexString() })
    },
    // TODO use correct deserialization
    decodeCursor: (cursor) => {
      return JSON.parse(cursor)
    },
  })
}
