import { delimiter } from 'path'
import { existsSync } from 'fs'
import { transformSync } from '@babel/core'

import { requireGql, defaultResolve } from './requireGql'

let resolve
export default ({ types: t }) => ({
  manipulateOptions({ resolveModuleSource }) {
    if (!resolve) {
      resolve = resolveModuleSource || defaultResolve
    }
  },
  visitor: {
    ImportDeclaration: {
      exit(curPath, { file: { opts: { filename: babelPath } }, opts: { nodePath } }) {
        const importNames = curPath.node.specifiers
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          // Find the file, using node resolution/NODE_PATH if necessary.
          const fallbackPaths = nodePath ? nodePath.split(delimiter) : process.env.NODE_PATH
          let absPath = resolve(importPath, babelPath)
          if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths: fallbackPaths })

          // Analyze the file, returning either schema source (str) or a docs object containing ops.
          const result = requireGql(absPath, { resolve, nowrap: false })

          if (typeof result === 'string') {
            curPath.replaceWith(buildVariableAST(result, importNames[0].local.name))
          } else {
            const replacements = buildReplacements(result, importNames)
            replacements.length > 1
              ? curPath.replaceWithMultiple(replacements)
              : curPath.replaceWith(replacements[0])
          }
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
          const { ast } = transformSync(`var ${importName} = ${JSON.stringify(graphqlAST)}`, {
            ast: true
          })
          return ast.program.body[0]
        }
      }
    }
  }
})

export { requireGql }
