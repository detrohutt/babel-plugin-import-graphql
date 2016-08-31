import BabelInlineImportPlugin from '../plugin';
import * as babel from 'babel-core';

describe('Babel Inline Import - Plugin', () => {
  describe('Babel Plugin', () => {
    it('transforms the import statement into a variable with the intended content', () => {
      const transformedCode = babel.transform("import SomeExample from './fixtures/example.raw';", {
        filename: __filename,
        plugins: [BabelInlineImportPlugin]
      });

      expect(transformedCode.code).to.equal(`var SomeExample = 'a raw content\\n';`);
    });

    it('accepts different extensions', () => {
      const transformedCode = babel.transform("import SomeExample from './fixtures/example.py';", {
        filename: __filename,
        plugins: [[
          BabelInlineImportPlugin, {
            extensions: [
              '.py'
            ]
          }
        ]]
      });

      expect(transformedCode.code).to.equal(`var SomeExample = 'print 1 + 1\\n';`);
    });

    it('doesn`t act when importing with destructuring', () => {
      const transformedCode = babel.transform("import { SomeExample, AnotherExample } from './fixtures/example.raw';", {
        filename: __filename,
        plugins: [BabelInlineImportPlugin]
      });

      expect(transformedCode.code).to.equal("import { SomeExample, AnotherExample } from './fixtures/example.raw';");
    });
  });
});
