import fs from 'fs';
import path from 'path';
import requireResolve from 'require-resolve';

export default class BabelInlineImportHelper {
  static extensions = [
    '.raw',
    '.text',
    '.graphql',
  ];

  static root = global.rootPath || process.cwd();

  static shouldBeInlined(givenPath, extensions) {
    const accept = (typeof extensions === 'string')
      ? [extensions]
      : (extensions || BabelInlineImportHelper.extensions);

    for (const extension of accept) {
      if (givenPath.endsWith(extension)) {
        return true;
      }
    }

    return false;
  }

  static getContents(givenPath, reference) {
    if (!reference) {
      throw new Error('"reference" argument must be specified');
    }

    const mod = requireResolve(givenPath, path.resolve(reference));

    if (!mod || !mod.src) {
      throw new Error(`Path '${givenPath}' could not be found for '${reference}'`);
    }

    return fs.readFileSync(mod.src).toString();
  }

  static transformRelativeToRootPath(path, rootPathSuffix) {
    if (this.hasRoot(path)) {
      const withoutRoot = path.substring(1, path.length);
      return `${BabelInlineImportHelper.root}${rootPathSuffix || ''}/${withoutRoot}`;
    }
    if (typeof path === 'string') {
      return path;
    }
    throw new Error('ERROR: No path passed');
  }

  static hasRoot(string) {
    if (typeof string !== 'string') {
      return false;
    }

    return string.substring(0, 1) === '/';
  }
}
