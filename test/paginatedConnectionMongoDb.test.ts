import { mongoDbPaginatedConnection } from '../src/paginatedConnectionMongoDb'
import { ObjectId, WithId } from 'mongodb'

import tap from 'tap'
import { decodeCursor, encodeCursor } from '../src/cursor'

export type MongoDbDoc = WithId<{
  name: string
  premium: boolean
}>

tap.test(
  'should return expected items when no pagination input provided',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {},
      paginationSafeLimit: 100,
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
                after: item._id.toHexString(),
              }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[dataLoaderItems.length - 1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, false, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({
              after: item._id.toHexString(),
            }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items when pagination.first provided',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: { first: 2 },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(0, props.first).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({ after: item._id.toHexString() }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, true, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.slice(0, 2).map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items when pagination.after provided',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {
        after: encodeCursor({
          node: dataLoaderItems[1],
          getCursor: () => ({ after: dataLoaderItems[1]._id.toHexString() }),
        }),
      },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(2, props.first).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({ after: item._id.toHexString() }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[dataLoaderItems.length - 1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, false, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.slice(2, 100).map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items when pagination.after and pagination.first provided',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {
        first: 2,
        after: encodeCursor({
          node: dataLoaderItems[1],
          getCursor: () => ({ after: dataLoaderItems[1]._id.toHexString() }),
        }),
      },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(2, 5).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({ after: item._id.toHexString() }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[3]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, true, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.slice(2, 4).map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items when no input.first is too big',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {
        first: 500,
      },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(0, props.first).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({ after: item._id.toHexString() }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[dataLoaderItems.length - 1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, false, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return first page when not valid input.after cursor provided',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {
        after: 'foobar',
      },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems.slice(0, props.first).map((item) => ({
            node: item,
            cursor: props.encodeCursor({
              node: item,
              getCursor: () => ({ after: item._id.toHexString() }),
            }),
          })),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[dataLoaderItems.length - 1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, false, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items when no pagination input provided and hasNextPage should be true',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: {},
      paginationSafeLimit: 2,
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
                after: item._id.toHexString(),
              }),
            }),
          })),
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, true, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.slice(0, 2).map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({
              after: item._id.toHexString(),
            }),
          }),
        }
      }),
      {}
    )
  }
)

tap.test(
  'should return expected items using createEdge function',
  async (t) => {
    const dataLoaderItems = [
      {
        _id: new ObjectId(),
        name: 'name1',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name2',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name3',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name4',
        premium: true,
      } as MongoDbDoc,
      {
        _id: new ObjectId(),
        name: 'name5',
        premium: true,
      } as MongoDbDoc,
    ]

    const data = await mongoDbPaginatedConnection<MongoDbDoc>({
      pagination: { first: 2 },
      paginationSafeLimit: 100,
      countLoader: async () => {
        return 5
      },
      dataLoader: async (props) => {
        return {
          edges: dataLoaderItems
            .slice(0, props.first)
            .map((item) =>
              props.createEdge(item, () => ({ after: item._id.toHexString() }))
            ),
          hasNextPage: dataLoaderItems.length > props.first,
        }
      },
    })

    t.same(
      decodeCursor(data.pageInfo.endCursor),
      {
        after: dataLoaderItems[1]._id.toHexString(),
      },
      'should match endCursor content value'
    )

    t.equal(await data.totalCount(), 5, 'should match totalCount value')

    t.equal(data.pageInfo.hasNextPage, true, 'should match hasNextPage value')

    t.same(
      data.edges,
      dataLoaderItems.slice(0, 2).map((item) => {
        return {
          node: item,
          cursor: encodeCursor({
            node: item,
            getCursor: () => ({ after: item._id.toHexString() }),
          }),
        }
      }),
      {}
    )
  }
)
