import path from 'path'
import { transformWithPlugin, rmVarKeywords, nameOf } from './util'

// beforeAll(() => (process.env.NODE_PATH = __dirname))
//
// afterAll(() => console.log('NODE_PATH', process.env.NODE_PATH))

describe('single simple query document', () => {
  test('loads query as default import with any name', () => {
    const { code } = transformWithPlugin('./fixtures/simple/default.js')
    let simpleQuery
    eval(code.slice(4))
    expect(nameOf(simpleQuery)).toBe('simple')
  })

  test('loads query as named import', () => {
    const { code } = transformWithPlugin('./fixtures/simple/named.js')
    let simple
    eval(code.slice(4))
    expect(nameOf(simple)).toBe('simple')
  })

  test('loads query as named import with alias', () => {
    const { code } = transformWithPlugin('./fixtures/simple/alias.js')
    let simpleAlias
    eval(code.slice(4))
    expect(nameOf(simpleAlias)).toBe('simple')
  })
})

describe('multiple simple operations document', () => {
  test('loads first operation as default import with any name', () => {
    const { code } = transformWithPlugin('./fixtures/multiple/default.js')
    let firstOperation
    eval(code.slice(4))
    expect(firstOperation.definitions[0].name.value).toBe('first')
  })

  test('loads operations out of order as named imports', () => {
    const { code } = transformWithPlugin('./fixtures/multiple/reverse.js')
    let first, second
    eval(rmVarKeywords(code))
    expect(nameOf(second)).toBe('second')
    expect(nameOf(first)).toBe('first')
  })

  test('loads operations as named imports with aliases', () => {
    const { code } = transformWithPlugin('./fixtures/multiple/aliases.js')
    let firstAlias, secondAlias
    eval(rmVarKeywords(code))
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(secondAlias)).toBe('second')
  })

  test('loads operations as namespaced import', () => {
    const { code } = transformWithPlugin('./fixtures/multiple/namespace.js')
    let ops
    eval(code.slice(4))
    expect(nameOf(ops.first)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
  })
})
