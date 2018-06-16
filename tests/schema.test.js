import path from 'path'
import { transformWithPlugin } from './util'

describe.each([{ runtime: true }, {}])('plugin options = %j', opts => {
  describe('simple schema document', () => {
    test('inlines as raw source text', () => {
      const { code } = transformWithPlugin('./fixtures/schema/simple/default.js', opts)
      let _graphqlTag, _graphqlTag2, schema
      eval(code)
      expect(schema).toMatchSnapshot()
    })
  })
})
