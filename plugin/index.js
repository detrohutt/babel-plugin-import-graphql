import path from 'path'
import os from 'os'
import fs from 'fs'
import gql from 'graphql-tag'
import { parse } from 'babylon'

export default ({ types: t }) => ({
	visitor: {
		ImportDeclaration: {
			exit(curPath, state) {
				const importPath = curPath.node.source.value
				if (importPath.endsWith('.graphql') || importPath.endsWith('.gql')) {
					const query = createQuery(importPath, state.file.opts.filename)
					query.processFragments()
					query.parse()
					curPath.replaceWith(t.variableDeclaration('const', [buildInlineVariable(query.ast)]))

					function buildInlineVariable (graphqlAST) {
						const babelAST = parse('const obj = ' + JSON.stringify(graphqlAST))
						const objExp = babelAST.program.body[0].declarations[0].init
						return t.variableDeclarator(
							t.identifier(curPath.node.specifiers[0].local.name),
							t.objectExpression(objExp.properties)
						)
					}
				}
			}
		}
	}
})

function createQuery (queryPath, babelPath) {
	const absPath = path.resolve(path.dirname(babelPath), queryPath)
	const source = fs.readFileSync(absPath).toString()
	let ast = null
	let fragmentDefs = []

	return {
		processFragments () {
			const imports = source.split(os.EOL).filter(line => line.startsWith('#import'))
			imports.forEach(statement => {
				const fragmentPath = statement.split(' ')[1].slice(1, -1)
				const absFragmentPath = path.resolve(path.dirname(absPath), fragmentPath)
				const fragmentSource = fs.readFileSync(absFragmentPath).toString()
				fragmentDefs = [...fragmentDefs, ...gql`${fragmentSource}`.definitions]
			})
		},
		parse () {
			const parsedAST = gql`${source}`
			parsedAST.definitions = [...parsedAST.definitions, ...fragmentDefs]
			ast = parsedAST
		},
		get ast () { return ast }
	}
}
