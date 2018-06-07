import path from 'path'
import { transformWithPlugin } from './util'

describe.each([{ runtime: true }, {}])('plugin options = %j', opts => {
  describe('indented query document', () => {
    test('imports correctly with leading spaces', () => {
      const { code } = transformWithPlugin('./fixtures/whitespace/spaces.js', opts)
      let _graphqlTag, spaces
      eval(code)
      expect(spaces.kind).toBe('Document')
    })

    test('imports correctly with leading tabs', () => {
      const { code } = transformWithPlugin('./fixtures/whitespace/tabs.js', opts)
      let _graphqlTag, tabs
      eval(code)
      expect(tabs.kind).toBe('Document')
    })
  })
})
