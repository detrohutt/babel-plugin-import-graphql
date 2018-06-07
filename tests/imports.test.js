import path from 'path'
import { transformWithPlugin, nameOf } from './util'

describe.each([{ runtime: true }, {}])('plugin options = %j', opts => {
  describe('single named query document', () => {
    test(`import namedQuery from '../../shared/named.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/named/default.js', opts)
      let _graphqlTag, namedQuery
      eval(code)
      expect(namedQuery.kind).toBe('Document')
    })

    test(`import { named } from '../../shared/named.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/named/named.js', opts)
      let _graphqlTag, named
      eval(code)
      expect(nameOf(named)).toBe('named')
    })

    test(`import { named as namedAlias } from '../../shared/named.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/named/alias.js', opts)
      let _graphqlTag, namedAlias
      eval(code)
      expect(nameOf(namedAlias)).toBe('named')
    })
  })

  describe('single unnamed query document', () => {
    test(`import unnamedQuery from '../../shared/unnamed.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/unnamed/default.js', opts)
      let _graphqlTag, unnamedQuery
      eval(code)
      expect(unnamedQuery.kind).toBe('Document')
    })

    test(`import { unnamed } from '../../shared/unnamed.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/unnamed/named.js', opts)
      let _graphqlTag, unnamed
      eval(code)
      expect(unnamed.kind).toBe('Document')
    })

    test(`import { unnamed as unnamedAlias } from '../../shared/unnamed.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/unnamed/alias.js', opts)
      let _graphqlTag, unnamedAlias
      eval(code)
      expect(unnamedAlias.kind).toBe('Document')
    })
  })

  describe('multiple operations document with fragment at top', () => {
    test(`import { notAnOperation } from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/fragment/mixed.js', opts)
      let _graphqlTag, notAnOperation
      eval(code)
      expect(notAnOperation.kind).toBe('Document')
    })

    test(`import firstOperation from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/default.js', opts)
      let _graphqlTag, firstOperation
      eval(code)
      expect(firstOperation.definitions[0].name.value).toBe('first')
    })

    test(`import { second, first } from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/reverse.js', opts)
      let _graphqlTag, first, second
      eval(code)
      expect(nameOf(second)).toBe('second')
      expect(nameOf(first)).toBe('first')
    })

    test(`import { first as firstAlias, second } from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/oneAlias.js', opts)
      let _graphqlTag, firstAlias, second
      eval(code)
      expect(nameOf(firstAlias)).toBe('first')
      expect(nameOf(second)).toBe('second')
    })

    test(`import { first as firstAlias, second as secondAlias } from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/aliases.js', opts)
      let _graphqlTag, firstAlias, secondAlias
      eval(code)
      expect(nameOf(firstAlias)).toBe('first')
      expect(nameOf(secondAlias)).toBe('second')
    })

    test(`import * as ops from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/namespace.js', opts)
      let _graphqlTag, ops
      eval(code)
      expect(nameOf(ops.notAnOperation)).toBe('notAnOperation')
      expect(nameOf(ops.first)).toBe('first')
      expect(nameOf(ops.second)).toBe('second')
    })

    test(`import firstOperation, { second, third } from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/multiple/defaultAndNamed.js', opts)
      let _graphqlTag, firstOperation, second, third
      eval(code)
      expect(nameOf(firstOperation)).toBe('first')
      expect(nameOf(second)).toBe('second')
      expect(nameOf(third)).toBe('third')
    })

    test(`import firstOperation, * as ops from '../../shared/multiple.graphql'`, () => {
      const { code } = transformWithPlugin(
        './fixtures/imports/multiple/defaultAndNamespace.js',
        opts
      )
      let _graphqlTag, firstOperation, ops
      eval(code)
      expect(nameOf(firstOperation)).toBe('first')
      expect(nameOf(ops.second)).toBe('second')
      expect(nameOf(ops.third)).toBe('third')
    })
  })

  describe('single fragment document', () => {
    test(`import frag from '../../shared/fragment.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/fragment/simple.js', opts)
      let _graphqlTag, frag
      eval(code)
      expect(frag.kind).toBe('Document')
      expect(frag.definitions[0].kind).toBe('FragmentDefinition')
    })
  })

  describe('multiple fragments document with no operations', () => {
    test(`import frag from '../../shared/fragments.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/fragment/multiDefault.js', opts)
      let _graphqlTag, frag
      eval(code)
      expect(nameOf(frag)).toBe('frag1')
    })

    test(`import { frag3, frag1, frag2 } from '../../shared/fragments.graphql'`, () => {
      const { code } = transformWithPlugin('./fixtures/imports/fragment/multiple.js', opts)
      let _graphqlTag, frag1, frag2, frag3
      eval(code)
      expect(nameOf(frag1)).toBe('frag1')
      expect(nameOf(frag2)).toBe('frag2')
      expect(nameOf(frag3)).toBe('frag3')
    })
  })
})
