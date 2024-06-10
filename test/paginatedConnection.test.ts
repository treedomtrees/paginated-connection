import { randomUUID } from 'crypto'

import tap from 'tap'
import { paginatedConnection } from '../src/paginatedConnection'

export type MysqlDoc = {
  id: string
  name: string
  premium: boolean
}

tap.test(
  'should return expected items when no pagination input provided',
  async (t) => {
    const dataLoaderItems = [
      {
        id: randomUUID(),
        name: 'name1',
        premium: true,
      } as MysqlDoc,
      {
        id: randomUUID(),
        name: 'name2',
        premium: true,
      } as MysqlDoc,
      {
        id: randomUUID(),
        name: 'name3',
        premium: true,
      } as MysqlDoc,
      {
        id: randomUUID(),
        name: 'name4',
        premium: true,
      } as MysqlDoc,
      {
        id: randomUUID(),
        name: 'name5',
        premium: true,
      } as MysqlDoc,
    ]

    const data = await paginatedConnection<MysqlDoc>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pagination: null as any,
      paginationSafeLimit: 100,
      decodeCursor: () => ({ after: 'foobar' }),
      encodeCursor: (cursor) => JSON.stringify(cursor),
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(0, props.first).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({
                after: item.id,
              }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, false, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.map((item) => {
        return {
          node: item,
          cursor: JSON.stringify({ node: item }),
        }
      }),
      {}
    )
  }
)
