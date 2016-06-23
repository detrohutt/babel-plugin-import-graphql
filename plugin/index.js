import BabelRootImportHelper from './helper';

export default function({ types: t }) {
  class BabelRootImport {
    constructor() {
      const that = this;
      return {
        visitor: {
          ImportDeclaration(path, state) {
            const givenPath = path.node.source.value;

            var rootPathSuffix = state && state.opts && typeof state.opts.rootPathSuffix === 'string' ?
            '/' + state.opts.rootPathSuffix.replace(/^(\/)|(\/)$/g, '') :
                '';

            if(BabelRootImportHelper().hasRoot(givenPath)) {
              path.node.source.value = BabelRootImportHelper().transformRelativeToRootPath(givenPath, rootPathSuffix);
            }
          }
        }
      };
    }
  }

  // Here's we detect the use of Meteor and send a dummy plugin.
  // That's because, Meteor already do this for us.
  //  global.meteorBabelHelpers is something we can see when
  //  running inside Meteor.
  if (global.meteorBabelHelpers) {
    return {
      visitor: {}
    };
  }

  return new BabelRootImport();
}
