import { delimiter } from 'path'
import { existsSync } from 'fs'

import { requireGql, defaultResolve } from './requireGql'

let resolve
export default ({ types: t, template }) => ({
  manipulateOptions({ resolveModuleSource }) {
    if (!resolve) {
      resolve = resolveModuleSource || defaultResolve
    }
  },
  visitor: {
    ImportDeclaration: {
      exit(curPath, { opts, file }) {
        const importPath = curPath.node.source.value
        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          // Find the file, using node resolution/NODE_PATH if necessary.
          const fallbackPaths = opts.nodePath
            ? opts.nodePath.split(delimiter)
            : process.env.NODE_PATH
          let absPath = resolve(importPath, file.opts.filename)
          if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths: fallbackPaths })

          // Analyze the file, returning either schema source (str) or a docs object containing ops.
          const result = requireGql(absPath, { resolve, nowrap: false })

          const importNames = curPath.node.specifiers
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
          const buildAst = template(`var IMPORT_NAME = AST;`)
          return buildAst({
            IMPORT_NAME: t.identifier(importName),
            AST: t.valueToNode(JSON.parse(JSON.stringify(graphqlAST)))
          })
        }
      }
    },
    VariableDeclarator: {
      exit(curPath, { opts, file }) {
        if (!curPath.node.init) {
          return
        }

        if (curPath.node.init.type !== 'CallExpression') {
          return
        }

        if (
          curPath.node.init.callee.type !== 'Identifier' &&
          curPath.node.init.callee.name !== 'require'
        ) {
          return
        }

        var importPath = curPath.node.init.arguments[0] ? curPath.node.init.arguments[0].value : ''

        if (!importPath || typeof importPath !== 'string') {
          return
        }

        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          // Find the file, using node resolution/NODE_PATH if necessary.
          const fallbackPaths = opts.nodePath
            ? opts.nodePath.split(delimiter)
            : process.env.NODE_PATH
          let absPath = resolve(importPath, file.opts.filename)
          if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths: fallbackPaths })

          // Analyze the file, returning either schema source (str) or a docs object containing ops.
          const result = requireGql(absPath, { resolve, nowrap: false })

          const importName = curPath.node.id.name

          if (result) {
            curPath.replaceWith(buildVariableAST(result, importName))
          } else {
            return curPath
          }
        }

        function buildVariableAST(graphqlAST, importName) {
          const buildAst = template(`var IMPORT_NAME = AST;`)
          return buildAst({
            IMPORT_NAME: t.identifier(importName),
            AST: t.valueToNode(JSON.parse(JSON.stringify(graphqlAST)))
          })
        }
      }
    }
  }
})
