import path, { dirname } from 'path'
import { EOL } from 'os'
import { readFileSync } from 'fs'
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
      exit (curPath, state) {
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          const query = createQuery(importPath, state.file.opts.filename)
          query.processFragments()
          query.parse()
          query.dedupeFragments()
          query.makeSourceEnumerable()
          curPath.replaceWith(buildInlineVariableAST(query.ast))
        }

        function buildInlineVariableAST (graphqlAST) {
          const inlineVarName = curPath.node.specifiers[0].local.name
          return parse(`const ${inlineVarName} = ${JSON.stringify(graphqlAST)}`).program.body[0]
        }
      }
    }
  }
})

function createQuery (queryPath, babelPath) {
  const absPath = resolve(queryPath, babelPath)
  const source = readFileSync(absPath).toString()
  let ast = null
  let fragmentDefs = []

  return {
    processFragments () {
      processImports(getImportStatements(source), absPath)

      function getImportStatements (src) {
        return src.split(EOL).filter(line => line.startsWith('#import'))
      }

      function processImports (imports, relFile) {
        imports.forEach(statement => {
          const fragmentPath = statement.split(/\s+/g)[1].slice(1, -1)
          const absFragmentPath = resolve(fragmentPath, relFile)
          const fragmentSource = readFileSync(absFragmentPath).toString()
          const subFragments = getImportStatements(fragmentSource)
          if (subFragments.length > 0) {
            processImports(subFragments, absFragmentPath)
          }
          fragmentDefs = [...gql`${fragmentSource}`.definitions, ...fragmentDefs]
        })
      }
    },
    parse () {
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
