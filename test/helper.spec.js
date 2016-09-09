import BabelInlineImportHelper from '../plugin/helper';

describe('Babel Inline Import - Helper', () => {

  describe('Class', () => {
    it('returns the default extensions', () => {
      expect(BabelInlineImportHelper.extensions).to.deep.equal([
        '.raw',
        '.text',
        '.graphql',
      ]);
    });
  });

  describe('shouldBeInlined', () => {
      it('accepts a default extension', () => {
        const shouldIt = BabelInlineImportHelper.shouldBeInlined('example.raw');
        expect(shouldIt).to.be.true;
      });

      it('rejects a non default extension', () => {
        const shouldIt = BabelInlineImportHelper.shouldBeInlined('example.js');
        expect(shouldIt).to.be.false;
      });

      it('accepts a user defined extension', () => {
        const shouldIt = BabelInlineImportHelper.shouldBeInlined('example.python', ['.python']);
        expect(shouldIt).to.be.true;
      });

      it('rejects a non user defined extension', () => {
        const shouldIt = BabelInlineImportHelper.shouldBeInlined('example.raw', ['.python']);
        expect(shouldIt).to.be.false;
      });

      it('throws error if no array or string is passed as extensions', () => {
        expect(() => {
          BabelInlineImportHelper.shouldBeInlined('example.raw', true);
        }).to.throw(Error);
      });
  });

  describe('getContents', () => {
    it('throws error if no reference is specified', () => {
      expect(() => {
        BabelInlineImportHelper.getContents('./fixtures/example.raw');
      }).to.throw(Error);
    });

    it('throws error if file does not exist', () => {
      expect(() => {
        BabelInlineImportHelper.getContents('non_existent.raw', __filename);
      }).to.throw(Error);
    });

    it('returns file content', () => {
      expect(BabelInlineImportHelper.getContents('./fixtures/example.raw', __filename)).to.equal('a raw content\n');
    });
  });
});
