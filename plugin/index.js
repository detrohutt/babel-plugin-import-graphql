import path from 'path'
import os from 'os'
import gql from 'graphql-tag'
import { parse } from 'babylon'
import BabelInlineImportHelper from './helper'

const filterFn = line =>
	!(line[0] === '#' && line.slice(1).split(' ')[0] === 'import') &&
	!(line === '')

const stripImports = source => source.split(os.EOL).filter(filterFn).join(os.EOL)

const expandImports = (source, resolvePath, reference) => {
	reference = path.dirname(reference)
	const queryAST = gql`${stripImports(source)}`
	const lines = source.split(os.EOL)
	let defs = queryAST.definitions
	lines.some(line => {
		if (line[0] === '#' && line.slice(1).split(' ')[0] === 'import') {
			const importFile = line.slice(1).split(' ')[1].slice(1, -1)
			const fragmentAST = gql`${BabelInlineImportHelper.getContents(importFile, path.resolve(reference, resolvePath))}`
			defs = [...defs, ...fragmentAST.definitions]
		}
		return line.length !== 0 && line[0] !== '#'
	})
	return { ...queryAST, ...{ definitions: defs } }
}

export default ({ types: t }) => ({
	visitor: {
		ImportDeclaration: {
			exit(path, state) {
				const {
					shouldBeInlined,
					hasRoot,
					transformRelativeToRootPath,
					getContents
				} = BabelInlineImportHelper

				const givenPath = path.node.source.value
				let reference = state && state.file && state.file.opts.filename
				const extensions = state && state.opts && state.opts.extensions

				if (BabelInlineImportHelper.shouldBeInlined(givenPath, extensions)) {
					if (path.node.specifiers.length > 1) {
						throw new Error(
							`Destructuring inlined import is not allowed. Check the import statement for '${givenPath}'`
						)
					}

					// Here we detect the use of Meteor by checking global.meteorBabelHelpers
					if (global.meteorBabelHelpers && hasRoot(reference)) {
						reference = transformRelativeToRootPath(reference)
					}

					const content = getContents(givenPath, reference)
					const graphqlAST = expandImports(content, givenPath, reference)
					const babelAST = parse('const obj = ' + JSON.stringify(graphqlAST))
					const objExp = babelAST.program.body[0].declarations[0].init
					const variable = t.variableDeclarator(
						t.identifier(path.node.specifiers[0].local.name),
						t.objectExpression(objExp.properties)
					)

					path.replaceWith(t.variableDeclaration('const', [variable]))
				}
			}
		}
	}
})
