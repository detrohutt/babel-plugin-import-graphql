import gql from 'graphql-tag'
import { parse } from 'babylon'
import BabelInlineImportHelper from './helper'

export default function({ types: t }) {
	class BabelInlineImport {
		constructor() {
			return {
				visitor: {
					ImportDeclaration: {
						exit(path, state) {
							const givenPath = path.node.source.value
							let reference = state && state.file && state.file.opts.filename
							const extensions = state && state.opts && state.opts.extensions

							if (
								BabelInlineImportHelper.shouldBeInlined(givenPath, extensions)
							) {
								if (path.node.specifiers.length > 1) {
									throw new Error(
										`Destructuring inlined import is not allowed. Check the import statement for '${givenPath}'`
									)
								}

								// Here we detect the use of Meteor by checking global.meteorBabelHelpers
								if (
									global.meteorBabelHelpers &&
									BabelInlineImportHelper.hasRoot(reference)
								) {
									reference = BabelInlineImportHelper.transformRelativeToRootPath(
										reference
									)
								}

								const id = path.node.specifiers[0].local.name
								const content = BabelInlineImportHelper.getContents(
									givenPath,
									reference
								)

								graphqlAST = gql`${content}`

								const babelAST = parse(
									'const obj = ' + JSON.stringify(graphqlAST)
								)

								const objExp = babelAST.program.body[0].declarations[0].init

								const variable = t.variableDeclarator(
									t.identifier(id),
									t.objectExpression(objExp.properties)
								)

								path.replaceWith(t.variableDeclaration('const', [variable]))
							}
						}
					}
				}
			}
		}
	}

	return new BabelInlineImport()
}
