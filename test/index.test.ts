import { mongoDbPaginatedConnection } from '../src/mongoDbPaginatedConnection'
import { ObjectId, WithId } from 'mongodb'

import tap from 'tap'

export type MongoDbDoc = WithId<{
  name: string
  premium: boolean
}>

tap.test('will pass', async (t) => {
  const data = await mongoDbPaginatedConnection<MongoDbDoc>({
    pagination: {},
    paginationSafeLimit: 10,
    countLoader: async (props) => {
      console.log(props)
      return Promise.resolve(5)
    },

    dataLoader: async (props) => {
      console.log(props.after)
      console.log(props.first)

      // Here should load n+1 elements
      const data = [
        {
          _id: new ObjectId(),
          name: '',
          premium: true,
        } as MongoDbDoc,
        {
          _id: new ObjectId(),
          name: '',
          premium: true,
        } as MongoDbDoc,
        {
          _id: new ObjectId(),
          name: '',
          premium: true,
        } as MongoDbDoc,
        {
          _id: new ObjectId(),
          name: '',
          premium: true,
        } as MongoDbDoc,
        {
          _id: new ObjectId(),
          name: '',
          premium: true,
        } as MongoDbDoc,
      ]

      return {
        data,
        edges: data.slice(0, props.first).map((item) => ({
          node: item,
          cursor: props.encodeCursor({
            node: item,
          }),
        })),
        hasNextPage: data.length > props.first,
      }
    },
  })

  console.log(await data.totalCount())
  console.log(data.edges)
  console.log(data.edges)
})
