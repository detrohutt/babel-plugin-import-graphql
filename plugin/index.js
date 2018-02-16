import path, { dirname } from 'path'
import { existsSync, readFileSync } from 'fs'
import { transformSync } from '@babel/core'
import gql from 'graphql-tag'

import { createDocPerOp } from './multi-op'

let resolve
export default ({ types: t }) => ({
  manipulateOptions({ resolveModuleSource }) {
    if (!resolve) {
      resolve = resolveModuleSource || ((src, file) => path.resolve(dirname(file), src))
    }
  },
  visitor: {
    ImportDeclaration: {
      exit(curPath, { file: { opts: { filename: babelPath } }, opts: { nodePath } }) {
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          const importNames = curPath.node.specifiers.map(s => s.local.name)
          const fallbackResolvePaths = nodePath
            ? nodePath.split(path.delimiter)
            : process.env.NODE_PATH
          const doc = processDoc(createDoc(importPath, babelPath, fallbackResolvePaths))

          const operations = doc.definitions.filter(d => d.kind === 'OperationDefinition')
          if (operations.length > 1) {
            const docs = createDocPerOp(doc)
            curPath.node.specifiers[0].type === 'ImportDefaultSpecifier'
              ? curPath.replaceWith(buildVariableAST(docs.default, importNames[0]))
              : curPath.replaceWithMultiple(importNames.map(n => buildVariableAST(docs[n], n)))
          } else {
            curPath.replaceWith(buildVariableAST(doc, importNames[0]))
          }
        }

        function buildVariableAST(graphqlAST, importName) {
          const { ast } = transformSync(`const ${importName} = ${JSON.stringify(graphqlAST)}`)
          return ast.program.body[0]
        }
      }
    }
  }
})

function createDoc(importPath, babelPath, paths) {
  let absPath = resolve(importPath, babelPath)
  if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths })
  const source = readFileSync(absPath).toString()
  let ast = null
  let fragmentDefs = []

  return {
    processFragments() {
      processImports(getImportStatements(source), absPath)

      function getImportStatements(src) {
        return src.split(/(\r\n|\r|\n)+/).filter(line => line.startsWith('#import'))
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
