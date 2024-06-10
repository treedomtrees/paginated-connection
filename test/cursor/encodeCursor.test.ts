import tap from 'tap'
import { encodeCursor } from '../../src/cursor'

tap.test('should return expected value with default cursor type', async (t) => {
  t.equal(
    encodeCursor({
      node: { id: '1', name: 'foobar' },
      getCursor: () => {
        return {
          after: '1',
        }
      },
    }),
    'YWZ0ZXI9MQ'
  )
})

tap.test('should return expected value with custom cursor type', async (t) => {
  t.equal(
    encodeCursor<
      { id: string; name: string },
      { after: string; sorting: string }
    >({
      node: { id: '1', name: 'foobar' },
      getCursor: () => {
        return {
          after: '1',
          sorting: '2',
        }
      },
    }),
    'YWZ0ZXI9MSZzb3J0aW5nPTI'
  )
})

tap.test(
  'should return expected value with custom cursor with enum field',
  async (t) => {
    enum Foobar {
      first = '11',
      second = '22',
      third = '33',
    }
    t.equal(
      encodeCursor<
        { id: string; name: string },
        { after: string; sorting: Foobar }
      >({
        node: { id: '1', name: 'foobar' },
        getCursor: () => {
          return {
            after: '1',
            sorting: Foobar.second,
          }
        },
      }),
      'YWZ0ZXI9MSZzb3J0aW5nPTIy'
    )
  }
)
