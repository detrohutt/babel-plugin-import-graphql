import fs from 'fs';
import path from 'path';
import requireResolve from 'require-resolve';

export default class BabelInlineImportHelper {
  static extensions = [
    '.raw',
    '.text',
    '.graphql',
  ];

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
    return fs.readFileSync(mod.src).toString();
  }
}
