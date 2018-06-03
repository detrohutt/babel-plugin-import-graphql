import path from 'path'
import { transformWithPlugin, nameOf } from './util'

describe('single named query document', () => {
  test(`import namedQuery from '../../shared/named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/default.js')
    let namedQuery
    eval(code)
    expect(namedQuery.kind).toBe('Document')
  })

  test(`import { named } from '../../shared/named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/named.js')
    let named
    eval(code)
    expect(nameOf(named)).toBe('named')
  })

  test(`import { named as namedAlias } from '../../shared/named.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/named/alias.js')
    let namedAlias
    eval(code)
    expect(nameOf(namedAlias)).toBe('named')
  })
})

describe('single unnamed query document', () => {
  test(`import unnamedQuery from '../../shared/unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/default.js')
    let unnamedQuery
    eval(code)
    expect(unnamedQuery.kind).toBe('Document')
  })

  test(`import { unnamed } from '../../shared/unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/named.js')
    let unnamed
    eval(code)
    expect(unnamed.kind).toBe('Document')
  })

  test(`import { unnamed as unnamedAlias } from '../../shared/unnamed.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/unnamed/alias.js')
    let unnamedAlias
    eval(code)
    expect(unnamedAlias.kind).toBe('Document')
  })
})

describe('multiple operations document with fragment at top', () => {
  test(`import { notAnOperation } from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/mixed.js')
    let notAnOperation
    eval(code)
    expect(notAnOperation.kind).toBe('Document')
  })

  test(`import firstOperation from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/default.js')
    let firstOperation
    eval(code)
    expect(firstOperation.definitions[0].name.value).toBe('first')
  })

  test(`import { second, first } from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/reverse.js')
    let first, second
    eval(code)
    expect(nameOf(second)).toBe('second')
    expect(nameOf(first)).toBe('first')
  })

  test(`import { first as firstAlias, second } from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/oneAlias.js')
    let firstAlias, second
    eval(code)
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(second)).toBe('second')
  })

  test(`import { first as firstAlias, second as secondAlias } from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/aliases.js')
    let firstAlias, secondAlias
    eval(code)
    expect(nameOf(firstAlias)).toBe('first')
    expect(nameOf(secondAlias)).toBe('second')
  })

  test(`import * as ops from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/namespace.js')
    let ops
    eval(code)
    expect(nameOf(ops.first)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
  })

  test(`import firstOperation, { second, third } from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamed.js')
    let firstOperation, second, third
    eval(code)
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(second)).toBe('second')
    expect(nameOf(third)).toBe('third')
  })

  test(`import firstOperation, * as ops from '../../shared/multiple.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamespace.js')
    let firstOperation, ops
    eval(code)
    expect(nameOf(firstOperation)).toBe('first')
    expect(nameOf(ops.second)).toBe('second')
    expect(nameOf(ops.third)).toBe('third')
  })
})

describe('single fragment document', () => {
  test(`import frag from '../../shared/fragment.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/simple.js')
    let frag
    eval(code)
    expect(frag.kind).toBe('Document')
    expect(frag.definitions[0].kind).toBe('FragmentDefinition')
  })
})

describe('multiple fragments document with no operations', () => {
  test(`import frag from '../../shared/fragments.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/multiDefault.js')
    let frag
    eval(code)
    expect(nameOf(frag)).toBe('frag1')
  })

  test(`import { frag3, frag1, frag2 } from '../../shared/fragments.graphql'`, () => {
    const { code } = transformWithPlugin('./fixtures/imports/fragment/multiple.js')
    let frag1, frag2, frag3
    eval(code)
    expect(nameOf(frag1)).toBe('frag1')
    expect(nameOf(frag2)).toBe('frag2')
    expect(nameOf(frag3)).toBe('frag3')
  })
})
