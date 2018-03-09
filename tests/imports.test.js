import path from 'path'
import { transformWithPlugin, rmVarKeywords, nameOf } from './util'

describe('single named query document', () => {
  test(`import namedQuery from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/default.js')
    let namedQuery
    eval(code.slice(4))
    expect(namedQuery.kind).toBe('Document')
  })

  test(`import { named } from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/named.js')
    let named
    eval(code.slice(4))
    expect(nameOf(named)).toBe('named')
  })

  test(`import { named as namedAlias } from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/alias.js')
    let namedAlias
    eval(code.slice(4))
    expect(nameOf(namedAlias)).toBe('named')
  })
})

describe('single unnamed query document', () => {
  test(`import unnamedQuery from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/default.js')
    let unnamedQuery
    eval(code.slice(4))
    expect(unnamedQuery.kind).toBe('Document')
  })

  test(`import { unnamed } from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/named.js')
    let unnamed
    eval(code.slice(4))
    expect(unnamed.kind).toBe('Document')
  })

  test(`import { unnamed as unnamedAlias } from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/alias.js')
    let unnamedAlias
    eval(code.slice(4))
    expect(unnamedAlias.kind).toBe('Document')
  })
})

describe('multiple operations document', () => {
  test(`import firstOperation from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/default.js')
    let firstOperation
    eval(code.slice(4))
    expect(firstOperation.definitions[0].name.value).toBe('first')
  })

  test(`import { second, first } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/reverse.js')
    let first, second
    eval(rmVarKeywords(code))
    expect(nameOf(second)).toBe('second')
    expect(nameOf(first)).toBe('first')
  })

  test(`import { first as firstAlias, second } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/oneAlias.js')
    let firstAlias, second
    eval(rmVarKeywords(code))
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(second)).toBe('second')
  })

  test(`import { first as firstAlias, second as secondAlias } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/aliases.js')
    let firstAlias, secondAlias
    eval(rmVarKeywords(code))
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(secondAlias)).toBe('second')
  })

  test(`import * as ops from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/namespace.js')
    let ops
    eval(code.slice(4))
    expect(nameOf(ops.first)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
  })

  test(`import firstOperation, { second, third } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamed.js')
    let firstOperation, second, third
    eval(rmVarKeywords(code))
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(second)).toBe('second')
    expect(nameOf(third)).toBe('third')
  })

  test(`import firstOperation, * as ops from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamespace.js')
    let firstOperation, ops
    eval(rmVarKeywords(code))
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
    expect(nameOf(ops.third)).toBe('third')
  })
})

describe('single fragment document', () => {
  test(`inlines as a FragmentDefinition`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/simple.js')
    let frag
    eval(code.slice(4))
    expect(frag.kind).toBe('Document')
    expect(frag.definitions[0].kind).toBe('FragmentDefinition')
  })
})
