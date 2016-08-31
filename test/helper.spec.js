import BabelRootImportHelper from '../plugin/helper';

describe('Babel Inline Import - Helper', () => {

  describe('transformRelativeToRootPath', () => {
      it('returns a string', () => {
        console.log(BabelRootImportHelper().transformRelativeToRootPath(''));
        const func = BabelRootImportHelper().transformRelativeToRootPath('');
        expect(func).to.be.a('string');
      });

      it('transforms given path relative root-path', () => {
        const rootPath = `${process.cwd()}/some/path`;
        const result = BabelRootImportHelper().transformRelativeToRootPath('/some/path');
        expect(result).to.equal(rootPath);
      });

      it('throws error if no string is passed', () => {
        expect(() => {
          BabelRootImportHelper().transformRelativeToRootPath();
        }).to.throw(Error);
      });
  });

  describe('Class', () => {
    it('returns the root path', () => {
      const rootByProcess = process.cwd();
      expect(BabelRootImportHelper().root).to.equal(rootByProcess);
    });
  });

  describe('transformRelativeToRootPath', () => {
    it('returns a string', () => {
      const func = BabelRootImportHelper().transformRelativeToRootPath('');
      expect(func).to.be.a('string');
    });

    it('transforms given path relative root-path', () => {
      const rootPath = `${process.cwd()}/some/path`;
      const result = BabelRootImportHelper().transformRelativeToRootPath('/some/path');
      expect(result).to.equal(rootPath);
    });

    it('throws error if no string is passed', () => {
      expect(() => {
        BabelRootImportHelper().transformRelativeToRootPath();
      }).to.throw(Error);
    });
  });


  describe('hasRoot', () => {
    it('returns a boolean', () => {
      const func = BabelRootImportHelper().hasRoot();
      expect(func).to.be.a('boolean');
    });

    it('check if the string has "/" at the beginning', () => {
      const withRoot = BabelRootImportHelper().hasRoot('/path');
      const withoutRoot = BabelRootImportHelper().hasRoot('./some/path');
      expect(withoutRoot).to.be.false;
      expect(withRoot).to.be.true;
    });

    it('returns false if no string passed', () => {
      const nothingPassed = BabelRootImportHelper().hasRoot();
      const wrongTypePassed = BabelRootImportHelper().hasRoot([]);
      expect(nothingPassed).to.be.false;
      expect(wrongTypePassed).to.be.false;
    });
  });
});
