import path from 'path'
import { transformWithPlugin, nameOf } from './util'

describe('single named query document', () => {
  test(`import namedQuery from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/default.js')
    let namedQuery
    eval(code)
    expect(namedQuery.kind).toBe('Document')
  })

  test(`import { named } from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/named.js')
    let named
    eval(code)
    expect(nameOf(named)).toBe('named')
  })

  test(`import { named as namedAlias } from './named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/alias.js')
    let namedAlias
    eval(code)
    expect(nameOf(namedAlias)).toBe('named')
  })
})

describe('single unnamed query document', () => {
  test(`import unnamedQuery from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/default.js')
    let unnamedQuery
    eval(code)
    expect(unnamedQuery.kind).toBe('Document')
  })

  test(`import { unnamed } from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/named.js')
    let unnamed
    eval(code)
    expect(unnamed.kind).toBe('Document')
  })

  test(`import { unnamed as unnamedAlias } from './unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/alias.js')
    let unnamedAlias
    eval(code)
    expect(unnamedAlias.kind).toBe('Document')
  })
})

describe('multiple operations document', () => {
  test(`import firstOperation from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/default.js')
    let firstOperation
    eval(code)
    expect(firstOperation.definitions[0].name.value).toBe('first')
  })

  test(`import { second, first } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/reverse.js')
    let first, second
    eval(code)
    expect(nameOf(second)).toBe('second')
    expect(nameOf(first)).toBe('first')
  })

  test(`import { first as firstAlias, second } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/oneAlias.js')
    let firstAlias, second
    eval(code)
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(second)).toBe('second')
  })

  test(`import { first as firstAlias, second as secondAlias } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/aliases.js')
    let firstAlias, secondAlias
    eval(code)
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(secondAlias)).toBe('second')
  })

  test(`import * as ops from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/namespace.js')
    let ops
    eval(code)
    expect(nameOf(ops.first)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
  })

  test(`import firstOperation, { second, third } from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamed.js')
    let firstOperation, second, third
    eval(code)
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(second)).toBe('second')
    expect(nameOf(third)).toBe('third')
  })

  test(`import firstOperation, * as ops from './multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamespace.js')
    let firstOperation, ops
    eval(code)
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
    expect(nameOf(ops.third)).toBe('third')
  })
})

describe('single fragment document', () => {
  test(`inlines as a FragmentDefinition`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/simple.js')
    let frag
    eval(code)
    expect(frag.kind).toBe('Document')
    expect(frag.definitions[0].kind).toBe('FragmentDefinition')
  })
})

describe('multiple fragments document with no operations', () => {
  test(`handles named imports correctly`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/multiple.js')
    let frag1, frag2, frag3
    eval(code)
    expect(frag1.kind).toBe('Document')
    expect(frag1.definitions[0].kind).toBe('FragmentDefinition')
  })

  test(`handles default import correctly`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/multiDefault.js')
    let frag
    eval(code)
    expect(frag.definitions[0].name.value).toBe('frag1')
  })
})
