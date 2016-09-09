import BabelInlineImportHelper from './helper';

export default function({ types: t }) {
  class BabelInlineImport {
    constructor() {
      return {
        visitor: {
          ImportDeclaration: {
            exit(path, state) {
              const givenPath = path.node.source.value;
              const reference = state && state.file && state.file.opts.filename;
              const extensions = state && state.opts && state.opts.extensions;

              if (BabelInlineImportHelper.shouldBeInlined(givenPath, extensions)) {
                if (path.node.specifiers.length > 1) {
                  throw new Error(`Destructuring inlined import is not allowed. Check the import statement for '${givenPath}'`);
                }

                const id = path.node.specifiers[0].local.name;
                const content = BabelInlineImportHelper.getContents(givenPath, reference);
                const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(content));

                path.replaceWith(
                  t.variableDeclaration('const', [variable])
                );
              }
            }
          }
        }
      };
    }
  }

  return new BabelInlineImport();
}
