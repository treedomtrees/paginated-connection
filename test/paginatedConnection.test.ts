import { randomUUID } from 'crypto'

import tap from 'tap'
import { paginatedConnection } from '../src/paginatedConnection'
import { encodeCursor } from '../src/cursor'

export type Doc = {
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
      } as Doc,
      {
        id: randomUUID(),
        name: 'name2',
        premium: true,
      } as Doc,
      {
        id: randomUUID(),
        name: 'name3',
        premium: true,
      } as Doc,
      {
        id: randomUUID(),
        name: 'name4',
        premium: true,
      } as Doc,
      {
        id: randomUUID(),
        name: 'name5',
        premium: true,
      } as Doc,
    ]

    const data = await paginatedConnection<Doc>({
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

tap.test('should dataloader handler get cursor data', async (t) => {
  const dataLoaderItems = [
    {
      id: randomUUID(),
      name: 'name1',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name2',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name3',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name4',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name5',
      premium: true,
    } as Doc,
  ]

  await paginatedConnection<Doc>({
    pagination: {
      after: encodeCursor({
        node: dataLoaderItems[0],
        getCursor: () => ({
          after: dataLoaderItems[0].id,
        }),
      }),
      first: 1,
    },
    paginationSafeLimit: 100,
    decodeCursor: () => ({ after: dataLoaderItems[0].id }),
    encodeCursor: (cursor) => JSON.stringify(cursor),
    countLoader: async () => {
      return 5
    },
    dataLoader: async (props) => {
      t.same(
        props.cursor,
        { after: dataLoaderItems[0].id },
        'should match after value'
      )

      return {
        edges: dataLoaderItems.slice(1, props.first).map((item) => {
          return props.createEdge(item, () => ({
            after: item.id,
          }))
        }),
        hasNextPage: dataLoaderItems.length > props.first,
      }
    },
  })
})

tap.test('should dataloader handler get createEdge function', async (t) => {
  const dataLoaderItems = [
    {
      id: randomUUID(),
      name: 'name1',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name2',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name3',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name4',
      premium: true,
    } as Doc,
    {
      id: randomUUID(),
      name: 'name5',
      premium: true,
    } as Doc,
  ]

  await paginatedConnection<Doc>({
    pagination: {
      after: encodeCursor({
        node: dataLoaderItems[0],
        getCursor: () => ({
          after: dataLoaderItems[0].id,
        }),
      }),
      first: 1,
    },
    paginationSafeLimit: 100,
    decodeCursor: () => ({ after: dataLoaderItems[0].id }),
    encodeCursor: (cursor) => JSON.stringify(cursor),
    countLoader: async () => {
      return 5
    },
    dataLoader: async (props) => {
      t.same(
        props.cursor,
        { after: dataLoaderItems[0].id },
        'should match after value'
      )

      return {
        edges: dataLoaderItems.slice(1, props.first).map((item) => {
          return props.createEdge(item, () => ({
            after: item.id,
          }))
        }),
        hasNextPage: dataLoaderItems.length > props.first,
      }
    },
  })
})
