import { delimiter } from 'path'
import { existsSync } from 'fs'

import { print } from 'graphql/language'

import { requireGql, defaultResolve } from './requireGql'
import { missingOptionalDep } from './errorMessages'

let resolve
let seenJSFiles = new Set()
export default ({ types: t, template }) => ({
  manipulateOptions({ resolveModuleSource, plugins }) {
    resolve = resolveModuleSource || defaultResolve

    const thisPlugin = plugins.find(p => {
      const key = p.key || p[0].key
      return key.indexOf('babel-plugin-import-graphql') !== -1
    })

    const options = thisPlugin.options || thisPlugin[1]
    if (options.runtime) {
      try {
        require('graphql-tag')
      } catch (e) {
        throw new Error(missingOptionalDep)
      }
    }
  },
  visitor: {
    ImportDeclaration: {
      exit(curPath, { opts, file }) {
        const importPath = curPath.node.source.value
        const jsFilename = file.opts.filename

        if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
          // Find the file, using node resolution/NODE_PATH if necessary.
          const fallbackPaths = opts.nodePath
            ? opts.nodePath.split(delimiter)
            : process.env.NODE_PATH
          let absPath = resolve(importPath, jsFilename)
          if (!existsSync(absPath)) absPath = require.resolve(importPath, { paths: fallbackPaths })

          // Analyze the file, returning one of the following...
          // For schema-like files: string - the GraphQL source code
          // For op/frag files: object - map of names to GraphQL Documents
          const result = requireGql(absPath, { resolve, nowrap: false })

          const importNames = curPath.node.specifiers
          if (typeof result === 'string') {
            curPath.replaceWith(buildSrcVarNode(result, importNames[0].local.name))
          } else {
            const replacements = buildReplacements(result, importNames, opts, seenJSFiles)
            replacements.length > 1
              ? curPath.replaceWithMultiple(replacements)
              : curPath.replaceWith(replacements[0])
          }
        }

        function buildReplacements(docs, specifiers, opts, seenJSFiles) {
          let replacements = []
          let buildVarNode = opts.runtime ? buildRuntimeVarNode : buildASTVarNode

          // Add the graphql-tag import to the first non-schema .graphql import in each .js file.
          if (opts.runtime && !seenJSFiles.has(jsFilename)) {
            replacements = [
              ...replacements,
              template(`import gql from 'graphql-tag'`, { sourceType: 'module' })()
            ]
          }

          seenJSFiles.add(jsFilename)

          const varNodes = specifiers.map(({ type, imported, local }) => {
            switch (type) {
              case 'ImportDefaultSpecifier':
                return buildVarNode(docs.default, local.name)
              case 'ImportSpecifier':
                return buildVarNode(docs[imported.name] || docs.default, local.name)
              case 'ImportNamespaceSpecifier':
                return buildVarNode(docs, local.name)
              default:
                throw new Error(`Unexpected import specifier type: ${type}`)
            }
          })

          return [...replacements, ...varNodes]
        }

        // Use to inline raw source when a schema-like file is detected.
        function buildSrcVarNode(graphqlSrc, importName) {
          const buildNode = template('var IMPORT_NAME = SOURCE;', { sourceType: 'module' })
          return buildNode({
            IMPORT_NAME: t.identifier(importName),
            SOURCE: t.stringLiteral(graphqlSrc)
          })
        }

        // Use to inline the raw GraphQL source text to be processed by 'graphql-tag' at runtime.
        function buildRuntimeVarNode(graphqlAST, importName) {
          if (graphqlAST.default) {
            const properties = Object.entries(graphqlAST).map(([key, value]) => {
              const expr = t.callExpression(t.identifier('gql'), [t.stringLiteral(print(value))])
              return t.objectProperty(t.stringLiteral(key), expr)
            })
            return template('var IMPORT_NAME = SOURCE', { sourceType: 'module' })({
              IMPORT_NAME: t.identifier(importName),
              SOURCE: t.objectExpression(properties)
            })
          }

          const buildNode = template('var IMPORT_NAME = gql(SOURCE);', { sourceType: 'module' })
          return buildNode({
            IMPORT_NAME: t.identifier(importName),
            SOURCE: t.stringLiteral(print(graphqlAST))
          })
        }

        // Use to inline the preprocessed AST object when the 'runtime' option is off.
        function buildASTVarNode(graphqlAST, importName) {
          const buildNode = template('var IMPORT_NAME = AST;', { sourceType: 'module' })
          const astNode = t.valueToNode(JSON.parse(JSON.stringify(graphqlAST)))
          astNode._compact = true
          return buildNode({ IMPORT_NAME: t.identifier(importName), AST: astNode })
        }
      }
    }
  }
})
