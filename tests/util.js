import path from 'path'
import { transformFileSync } from '@babel/core'

export function transformWithPlugin(pathname) {
  return transformFileSync(path.join(__dirname, pathname), {
    plugins: [path.join(__dirname, '../plugin/index.js')]
  })
}

export function rmVarKeywords(code) {
  return code
    .split('\n')
    .map(line => (line.startsWith('var ') ? line.slice(4) : line))
    .join('\n')
}

export function nameOf(operationDoc) {
  return operationDoc.definitions[0].name.value
}

export { default as dedent } from 'dedent'
