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
