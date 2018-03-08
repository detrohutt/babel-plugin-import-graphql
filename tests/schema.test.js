import path from 'path'
import { transformWithPlugin, dedent } from './util'

describe('simple schema document', () => {
  test(`import schema from './schema.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/schema/simple/default.js')
    let schema
    eval(code.slice(4))
    expect(schema).toBe(
      dedent`schema {
        query: Query
      }

      type Query {
        test: String
      }\n`
    )
  })
})
