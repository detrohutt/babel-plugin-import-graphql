import path, { dirname, delimiter } from 'path'
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
        const importNames = curPath.node.specifiers
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          // Find and fetch the file, using node resolution/NODE_PATH if necessary.
          const fallbackPaths = nodePath ? nodePath.split(delimiter) : process.env.NODE_PATH
          let absPath = resolve(importPath, babelPath)
          if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths: fallbackPaths })
          const source = readFileSync(absPath).toString()

          // If the file doesn't contain query/mutation/subscription, insert raw text, else parse.
          if (isSchemaLike(source)) {
            curPath.replaceWith(buildVariableAST(source, importNames[0].local.name))
          } else {
            const doc = processDoc(createDoc(source, absPath))

            const replacements = buildReplacements(createDocPerOp(doc), importNames)
            replacements.length > 1
              ? curPath.replaceWithMultiple(replacements)
              : curPath.replaceWith(replacements[0])
          }
        }

        function isSchemaLike(source) {
          const content = source
            .split(/(\r\n|\r|\n)+/)
            .filter(line => !line.startsWith('#'))
            .filter(line => line.length > 0)

          const operationsPattern = /^(query|mutation|subscription)/
          return !operationsPattern.test(content[0])
        }

        function buildReplacements(docs, specifiers) {
          return specifiers.map(({ type, imported, local }) => {
            switch (type) {
              case 'ImportDefaultSpecifier':
                return buildVariableAST(docs.default, local.name)
              case 'ImportSpecifier':
                return buildVariableAST(docs[imported.name] || docs.default, local.name)
              case 'ImportNamespaceSpecifier':
                return buildVariableAST(docs, local.name)
              default:
                throw new Error(`Unexpected import specifier type: ${type}`)
            }
          })
        }

        function buildVariableAST(graphqlAST, importName) {
          const { ast } = transformSync(`var ${importName} = ${JSON.stringify(graphqlAST)}`)
          return ast.program.body[0]
        }
      }
    }
  }
})

function createDoc(source, absPath) {
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
