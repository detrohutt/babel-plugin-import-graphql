import path from 'path'
import { transformWithPlugin } from './util'

describe('runtime option', () => {
  test('imports gql only once, even with multiple import lines', () => {
    const { code } = transformWithPlugin('./fixtures/runtime/separate/default.js', {
      runtime: true
    })
    expect(code).toMatchSnapshot()
  })
})
