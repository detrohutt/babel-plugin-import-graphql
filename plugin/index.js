import { dirname, resolve } from 'path'
import { EOL } from 'os'
import { readFileSync } from 'fs'
import { parse } from 'babylon'
import gql from 'graphql-tag'

export default ({ types: t }) => ({
  visitor: {
    ImportDeclaration: {
      enter (curPath, state) {
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          const query = createQuery(importPath, state.file.opts.filename)
          query.processFragments()
          query.parse()
          query.dedupeFragments()
          query.makeSourceEnumerable()
          curPath.replaceWith(t.variableDeclaration('const', [buildInlineVariable(query.ast)]))
        }

        function buildInlineVariable (graphqlAST) {
          const babelAST = parse(`(${JSON.stringify(graphqlAST)})`)
          const objExp = babelAST.program.body[0].expression
          return t.variableDeclarator(
            t.identifier(curPath.node.specifiers[0].local.name),
            t.objectExpression(objExp.properties)
          )
        }
      }
    }
  }
})

function createQuery (queryPath, babelPath) {
  const absPath = resolve(dirname(babelPath), queryPath)
  const source = readFileSync(absPath).toString()
  let ast = null
  let fragmentDefs = []

  return {
    processFragments () {
      processImports(getImportStatements(source), dirname(absPath))

      function getImportStatements (src) {
        return src.split(EOL).filter(line => line.startsWith('#import'))
      }

      function processImports (imports, relDir) {
        imports.forEach(statement => {
          const fragmentPath = statement.split(' ')[1].slice(1, -1)
          const absFragmentPath = resolve(relDir, fragmentPath)
          const fragmentSource = readFileSync(absFragmentPath).toString()
          const subFragments = getImportStatements(fragmentSource)
          if (subFragments.length > 0) {
            processImports(subFragments, dirname(absFragmentPath))
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
