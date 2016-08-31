import BabelInlineImportPlugin from '../plugin';
import * as babel from 'babel-core';

describe('Babel Inline Import - Plugin', () => {
  describe('Babel Plugin', () => {
    it('transforms the relative path into an absolute path', () => {
      const targetRequire = `${process.cwd()}/some/example.js`;
      const transformedCode = babel.transform("import SomeExample from '/some/example.js';", {
        plugins: [BabelInlineImportPlugin]
      });

      expect(transformedCode.code).to.contain(targetRequire);
    });

    it('transforms the relative path into an absolute path with the configured root-path', () => {
      const targetRequire = `some/custom/root/some/example.js`;
      const transformedCode = babel.transform("import SomeExample from '/some/example.js';", {
        plugins: [[
          BabelInlineImportPlugin, {
            rootPathSuffix: 'some/custom/root'
          }
        ]]
      });

      expect(transformedCode.code).to.contain(targetRequire);
    });
  });
});
