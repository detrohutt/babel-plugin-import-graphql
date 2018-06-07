import path from 'path'
import { transformWithPlugin, dedent } from './util'

describe.each([{ runtime: true }, {}])('plugin options = %j', opts => {
  describe('simple schema document', () => {
    test('inlines as raw source text', () => {
      const { code } = transformWithPlugin('./fixtures/schema/simple/default.js', opts)
      let _graphqlTag, schema
      eval(code)
      expect(schema).toBe(
        dedent`
        schema {
          query: Query
        }

        type Query {
          test: String
        }\n
      `
      )
    })
  })
})
