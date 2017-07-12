import fs from 'fs'
import path from 'path'
import resolve from 'resolve'

export default class BabelInlineImportHelper {
	static extensions = ['.graphql', '.gql']

	static root = global.rootPath || process.cwd()

	static shouldBeInlined(givenPath, extensions) {
		const accept = typeof extensions === 'string'
			? [extensions]
			: extensions || BabelInlineImportHelper.extensions

		for (const extension of accept) {
			if (givenPath.endsWith(extension)) {
				return true
			}
		}

		return false
	}

	static getContents(givenPath, reference) {
		if (!reference) {
			throw new Error('"reference" argument must be specified')
		}

		let filepath
		try {
			filepath = resolve.sync(givenPath, {
				basedir: path.dirname(reference),
				extensions: ['graphql', 'gql']
			})
		} catch (e) {
			throw new Error(
				`Path '${givenPath}' could not be found for '${reference}'`
			)
		}

		return fs.readFileSync(filepath).toString()
	}

	static transformRelativeToRootPath(pathArg, rootPathSuffix = '') {
		return path.resolve(BabelInlineImportHelper.root, rootPathSuffix, pathArg)
	}

	static hasRoot(string) {
		if (typeof string !== 'string') {
			return false
		}

		return path.isAbsolute(string)
	}
}
