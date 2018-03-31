import path from 'path'
import { transformWithPlugin } from './util'

describe('indented query document', () => {
  test(`imports correctly with leading spaces`, () => {
    const { code } = transformWithPlugin('./fixtures/whitespace/spaces.js')
    let spaces
    eval(code)
    expect(spaces.kind).toBe('Document')
  })

  test(`imports correctly with leading tabs`, () => {
    const { code } = transformWithPlugin('./fixtures/whitespace/tabs.js')
    let tabs
    eval(code)
    expect(tabs.kind).toBe('Document')
  })
})
