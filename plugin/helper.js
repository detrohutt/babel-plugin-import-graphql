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

	static transformRelativeToRootPath(path, rootPathSuffix) {
		if (this.hasRoot(path)) {
			const withoutRoot = path.substring(1, path.length)
			return `${BabelInlineImportHelper.root}${rootPathSuffix || ''}/${withoutRoot}`
		}
		if (typeof path === 'string') {
			return path
		}
		throw new Error('ERROR: No path passed')
	}

	static hasRoot(string) {
		if (typeof string !== 'string') {
			return false
		}

		return string.substring(0, 1) === '/'
	}
}
