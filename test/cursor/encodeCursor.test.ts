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
    'YWZ0ZXI9JTIyMSUyMg'
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
    'YWZ0ZXI9JTIyMSUyMiZzb3J0aW5nPSUyMjIlMjI'
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
      'YWZ0ZXI9JTIyMSUyMiZzb3J0aW5nPSUyMjIyJTIy'
    )
  }
)

tap.test(
  'should return expected value with custom cursor with number field',
  async (t) => {
    t.equal(
      encodeCursor<
        { id: string; name: string },
        { after: string; ranking: number }
      >({
        node: { id: '1', name: 'foobar' },
        getCursor: () => {
          return {
            after: '1',
            ranking: 1111,
          }
        },
      }),
      'YWZ0ZXI9JTIyMSUyMiZyYW5raW5nPTExMTE'
    )
  }
)

tap.test(
  'should return expected value with custom cursor with boolean field',
  async (t) => {
    t.equal(
      encodeCursor<
        { id: string; name: string },
        { after: string; enabled: boolean }
      >({
        node: { id: '1', name: 'foobar' },
        getCursor: () => {
          return {
            after: '1',
            enabled: true,
          }
        },
      }),
      'YWZ0ZXI9JTIyMSUyMiZlbmFibGVkPXRydWU'
    )
  }
)
