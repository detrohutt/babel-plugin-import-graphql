import { readFileSync, writeFileSync } from 'fs'
import path, { isAbsolute, join, dirname } from 'path'
import gql from 'graphql-tag'

import { createDocPerOp } from './multiOp'
import { newlinePattern, importPattern } from './constants'
import * as customImport from './customImport'

export const defaultResolve = (src, file) => path.resolve(dirname(file), src)

export const requireGql = (
  filepath,
  { resolve = defaultResolve, nowrap = true, emitDeclarations = false } = {}
) => {
  filepath = isAbsolute(filepath) ? filepath : join(callerDirname(), filepath)
  const source = readFileSync(filepath).toString()

  // If the file doesn't contain ops return raw text, else parse and return docsMap object.
  if (isSchemaLike(source)) {
    const imports = customImport.getFilepaths(source, filepath, resolve)

    if (imports.length === 0) return source

    // Resolve all #import statements (types, etc) recursively and concat them to the main source.
    return (
      imports
        .reduce((acc, fp) => [...acc, ...customImport.getSources(fp, resolve, [])], [])
        .map(stripImportStatements)
        .join('') + stripImportStatements(source)
    )
  }

  const doc = processDoc(createDoc(source, filepath, resolve))
  const docsMap = createDocPerOp(doc)

  if (emitDeclarations) {
    writeDTs(filepath, docsMap)
  }

  return nowrap && !doc.isMultiOp ? docsMap.default : docsMap
}

function writeDTs(filepath, docsMap) {
  const defLines = Object.keys(docsMap).map(key => {
    const commentBody = docsMap[key].loc.source.body
      .trim()
      .split('\n')
      .map(line => ` * ${line}`)
      .join('\n')

    const docComment = `/**\n * \`\`\`gql\n${commentBody}\n * \`\`\`\n */\n`

    if (key === 'default') {
      return `${docComment}declare const _ = ${JSON.stringify(
        docsMap[key] /* null, 2 */
      )} as const;\nexport default _;\n`
    }
    return `${docComment}export const ${key} = ${JSON.stringify(
      docsMap[key] /* null, 2 */
    )} as const;\n`
  })

  defLines.unshift(`/**\n * Generated at ${new Date().toISOString()}\n */\n`)

  defLines.push('')

  writeFileSync(filepath + '.d.ts', defLines.join('\n'))
}

function callerDirname() {
  // To avoid dependencies, I borrowed this from gh (sindresorhus/callsites/blob/master/index.js)
  const _ = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = new Error().stack.slice(1)
  Error.prepareStackTrace = _
  // End borrowed code

  const caller = stack.find(c => c.getTypeName() !== null)
  return dirname(caller.getFileName())
}

function isSchemaLike(source) {
  const content = source
    .split(newlinePattern)
    .filter(line => !newlinePattern.test(line))
    .filter(line => !line.startsWith('#'))
    .filter(line => line.length > 0)
    .map(line => line.trimLeft())

  const operationsPattern = /^(fragment|query|mutation|subscription)/
  return !operationsPattern.test(content[0])
}

function stripImportStatements(src) {
  return src.replace(importPattern, '')
}

function createDoc(source, filepath, resolve) {
  let ast = null
  let fragmentDefs = []

  return {
    processFragments() {
      // Resolve all #import statements (fragments) recursively and add them to the definitions
      customImport.getFilepaths(source, filepath, resolve).forEach(fp => {
        fragmentDefs = customImport
          .getSources(fp, resolve)
          .reduce((acc, src) => [...acc, ...gql(src).definitions], fragmentDefs)
      })
    },
    parse() {
      const parsedAST = gql(source)
      parsedAST.definitions = [...parsedAST.definitions, ...fragmentDefs]
      ast = parsedAST
    },
    dedupeFragments() {
      let seenNames = {}
      ast.definitions = ast.definitions.filter(def => {
        if (def.kind !== 'FragmentDefinition') return true
        return seenNames[def.name.value] ? false : (seenNames[def.name.value] = true)
      })
    },
    makeSourceEnumerable() {
      const newAST = JSON.parse(JSON.stringify(ast))
      newAST.loc.source = ast.loc.source
      ast = newAST
    },
    get ast() {
      return ast
    },
    get isMultiOp() {
      const countReducer = (acc, def) => (def.kind === 'OperationDefinition' ? (acc += 1) : acc)
      const opCount = ast.definitions.reduce(countReducer, 0)
      return opCount > 1
    },
    get isOnlyFrags() {
      return ast.definitions.every(d => d.kind === 'FragmentDefinition')
    }
  }
}

function processDoc(doc) {
  doc.processFragments()
  doc.parse()
  doc.dedupeFragments()
  doc.makeSourceEnumerable()
  return doc
}
