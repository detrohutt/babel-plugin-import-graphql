export default function(path) {
  class BabelRootImportHelper {

    root = global.rootPath || process.cwd();

    transformRelativeToRootPath(path, rootPathSuffix) {
      if (this.hasRoot(path)) {
        const withoutRoot = path.substring(1, path.length);
        return `${this.root}${rootPathSuffix ? rootPathSuffix : ''}/${withoutRoot}`;
      }
      if (typeof path === 'string') {
        return path;
      }
      throw new Error('ERROR: No path passed');
    }

    hasRoot(string) {
      let containsTilde = false;

      if (typeof string !== 'string') {
        return false;
      }

      const firstChar = string.substring(0, 1);
      return firstChar === '/';
    }
  }

  return new BabelRootImportHelper();
}
