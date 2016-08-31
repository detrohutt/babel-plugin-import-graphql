import BabelRootImportHelper from './helper';

export default function({ types: t }) {
  class BabelRootImport {
    constructor() {
      return {
        visitor: {
          ImportDeclaration(path, state) {
            const givenPath = path.node.source.value;
            const reference = state && state.file && state.file.opts.filename;
            const extensions = state && state.opts && state.opts.extensions;

            if(BabelRootImportHelper.shouldBeInlined(givenPath, extensions)) {
              const id = path.node.specifiers[0].local.name;
              const content = BabelRootImportHelper.getContents(givenPath, reference);
              const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(content));

              path.replaceWith(
                t.variableDeclaration('const', [variable])
              );
            }
          }
        }
      };
    }
  }

  return new BabelRootImport();
}
