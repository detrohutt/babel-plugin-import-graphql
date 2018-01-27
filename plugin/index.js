import path, { dirname } from 'path'
import { existsSync, readFileSync } from 'fs'
import { parse } from 'babylon'
import gql from 'graphql-tag'

let resolve

export default ({ types: t }) => ({
  manipulateOptions ({ resolveModuleSource }) {
    if (!resolve) {
      resolve = resolveModuleSource || ((src, file) => path.resolve(dirname(file), src))
    }
  },
  visitor: {
    ImportDeclaration: {
      exit (curPath, { file: { opts: { filename: babelPath } }, opts: { nodePath } }) {
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          const fallbackResolvePaths = nodePath ? nodePath.split(path.delimiter) : undefined
          const query = createQuery(importPath, babelPath, fallbackResolvePaths)
          query.processFragments()
          query.parse()
          query.dedupeFragments()
          query.makeSourceEnumerable()
          curPath.replaceWithMultiple(buildInlineVariableAST(query.ast))
        }

        function buildInlineVariableAST (graphqlAST) {
          const inlineVarName = curPath.node.specifiers[0].local.name
          return parse(`const ${inlineVarName} = ${JSON.stringify(graphqlAST)}`).program.body
        }
      }
    }
  }
})

function createQuery (queryPath, babelPath, paths) {
  let absPath = resolve(queryPath, babelPath)
  if (!existsSync(absPath)) absPath = require.resolve(queryPath, { paths })
  const source = readFileSync(absPath).toString()
  let ast = null
  let fragmentDefs = []

  return {
    processFragments () {
      processImports(getImportStatements(source), absPath)

      function getImportStatements (src) {
        return src
          .replace(/\r/g, '')
          .split(/\n+/g)
          .filter(line => line.startsWith('#import'))
      }

      function processImports (imports, relFile) {
        imports.forEach(statement => {
          const fragmentPath = statement.split(/[\s\n]+/g)[1].slice(1, -1)
          const absFragmentPath = resolve(fragmentPath, relFile)
          const fragmentSource = readFileSync(absFragmentPath.replace(/'/g, '')).toString()
          const subFragments = getImportStatements(fragmentSource)
          if (subFragments.length > 0) {
            processImports(subFragments, absFragmentPath)
          }
          // prettier-ignore
          fragmentDefs = [...gql`${fragmentSource}`.definitions, ...fragmentDefs]
        })
      }
    },
    parse () {
      // prettier-ignore
      const parsedAST = gql`${source}`
      parsedAST.definitions = [...parsedAST.definitions, ...fragmentDefs]
      ast = parsedAST
    },
    dedupeFragments () {
      let seenNames = {}
      ast.definitions = ast.definitions.filter(def => {
        if (def.kind !== 'FragmentDefinition') return true
        return seenNames[def.name.value] ? false : (seenNames[def.name.value] = true)
      })
    },
    makeSourceEnumerable () {
      const newAST = JSON.parse(JSON.stringify(ast))
      newAST.loc.source = ast.loc.source
      ast = newAST
    },
    get ast () {
      return ast
    }
  }
}
