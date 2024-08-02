import tap from 'tap'
import { decodeCursor } from '../../src/cursor'

tap.test('should return expected value with default cursor type', async (t) => {
  t.same(decodeCursor('YWZ0ZXI9MQ'), {
    after: '1',
  })
})

tap.test('should return expected value with custom cursor type', async (t) => {
  t.same(decodeCursor('YWZ0ZXI9MSZzb3J0aW5nPTI'), {
    after: '1',
    sorting: '2',
  })
})

tap.test(
  'should return expected value with custom cursor with enum field',
  async (t) => {
    enum Foobar {
      first = '11',
      second = '22',
      third = '33',
    }
    t.same(decodeCursor('YWZ0ZXI9MSZzb3J0aW5nPTIy'), {
      after: '1',
      sorting: Foobar.second,
    })
  }
)

tap.test("should return empty object when cursor isn't valid", async (t) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t.same(decodeCursor(1111 as any), {})
})

tap.test(
  'should return expected value with custom cursor with all handled value types',
  async (t) => {
    const decodedCursor = decodeCursor<{
      after: string
      ranking: number
      enabled: boolean
    }>('YWZ0ZXI9JTIyMSUyMiZlbmFibGVkPXRydWUmcmFua2luZz0xMTEx')
    t.same(decodedCursor, {
      after: '1',
      enabled: true,
      ranking: 1111,
    })

    t.ok(
      typeof decodedCursor.after === 'string',
      'should parse correctly string value'
    )
    t.ok(
      typeof decodedCursor.ranking === 'number',
      'should parse correctly number value'
    )
    t.ok(
      typeof decodedCursor.enabled === 'boolean',
      'should parse correctly boolean value'
    )
  }
)
