const gql = require('graphql-tag').default;
const parse = require('babylon').parse;

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  var BabelInlineImport = function BabelInlineImport() {
    _classCallCheck(this, BabelInlineImport);

    return {
      visitor: {
        ImportDeclaration: {
          exit: function exit(path, state) {
            var givenPath = path.node.source.value;
            var reference = state && state.file && state.file.opts.filename;
            var extensions = state && state.opts && state.opts.extensions;

            if (_helper2.default.shouldBeInlined(givenPath, extensions)) {
              if (path.node.specifiers.length > 1) {
                throw new Error('Destructuring inlined import is not allowed. Check the import statement for \'' + givenPath + '\'');
              }
              debugger;

              // Here we detect the use of Meteor by checking global.meteorBabelHelpers
              if (global.meteorBabelHelpers && _helper2.default.hasRoot(reference)) {
                reference = _helper2.default.transformRelativeToRootPath(reference);
              }

              var id = path.node.specifiers[0].local.name;
              var content = _helper2.default.getContents(givenPath, reference);

              graphqlAST = gql`${content}`

              const babelAST = parse("const obj = " + JSON.stringify(graphqlAST));

              const objExp = babelAST.program.body[0].declarations[0].init

              var variable = t.variableDeclarator(t.identifier(id), t.objectExpression(objExp.properties));

              path.replaceWith(t.variableDeclaration('const', [variable]));
            }
          }
        }
      }
    };
  };

  return new BabelInlineImport();
};

var _helper = require('./helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
