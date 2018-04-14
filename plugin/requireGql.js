import { readFileSync } from 'fs'
import path, { isAbsolute, join, dirname } from 'path'
import gql from 'graphql-tag'

import { createDocPerOp } from './multi-op'

const newlinePattern = /(\r\n|\r|\n)+/

export const defaultResolve = (src, file) => path.resolve(dirname(file), src)

export const requireGql = (filepath, { resolve = defaultResolve, nowrap = true } = {}) => {
  filepath = isAbsolute(filepath) ? filepath : join(callerDirname(), filepath)
  const source = readFileSync(filepath).toString()

  // If the file doesn't contain ops return raw text, else parse  and return docs object.
  if (isSchemaLike(source)) return source

  const docs = createDocPerOp(processDoc(createDoc(source, filepath, resolve)))
  return nowrap && Object.keys(docs).length <= 2 ? docs.default : docs
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

function createDoc(source, filepath, resolve) {
  let ast = null
  let fragmentDefs = []

  return {
    processFragments() {
      processImports(getImportStatements(source), filepath)

      function getImportStatements(src) {
        return src.split(newlinePattern).filter(line => line.startsWith('#import'))
      }

      function processImports(imports, relFile) {
        imports.forEach(statement => {
          const fragmentPath = statement.split(/[\s\n]+/g)[1].slice(1, -1)
          const absFragmentPath = resolve(fragmentPath, relFile)
          const fragmentSource = readFileSync(absFragmentPath.replace(/'/g, '')).toString()
          const subFragments = getImportStatements(fragmentSource)
          if (subFragments.length > 0) processImports(subFragments, absFragmentPath)
          // prettier-ignore
          fragmentDefs = [...gql`${fragmentSource}`.definitions, ...fragmentDefs]
        })
      }
    },
    parse() {
      // prettier-ignore
      const parsedAST = gql`${source}`
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
    }
  }
}

function processDoc(doc) {
  doc.processFragments()
  doc.parse()
  doc.dedupeFragments()
  doc.makeSourceEnumerable()
  return doc.ast
}
