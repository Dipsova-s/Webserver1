describe("Utilities test", function () {

    describe("The GUID generator should work as expect", function () {

        it("It is possible to generate the GUID", function () {
            expect(jQuery.GUID()).not.toBeUndefined();
        });

        it("It is possible to generate the different of GUID", function () {
            var guid1 = jQuery.GUID();
            var guid2 = jQuery.GUID();
            var guid3 = jQuery.GUID();

            expect(guid1).not.toEqual(guid2);
            expect(guid2).not.toEqual(guid3);
            expect(guid1).not.toEqual(guid3);
        });

        it("It must have 36 chars", function () {
            var expectLength = 36;
            var guid = jQuery.GUID();
            expect(guid.length).toEqual(expectLength);
        });

    });

    describe("The HTML Encode should work as expect", function () {

        it("It is possible to Encode the html", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var encodedText = htmlEncode(text);
            expect(encodedText).not.toContain('©');
            expect(encodedText).not.toContain('𝌆');
            expect(encodedText).not.toContain('☃');
            expect(encodedText).not.toContain('>');
            expect(encodedText).not.toContain('<');
            expect(encodedText).not.toContain('"');
        });

        it("It is still have the valid words", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var encodedText = htmlEncode(text);
            expect(encodedText).toContain('Foo');
            expect(encodedText).toContain('bar');
            expect(encodedText).toContain('baz');
            expect(encodedText).toContain('qux');
        });
    });

    describe("The name of the excel should work as expect", function () {

        it("It is possible to get the valid sheet name", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var actualText = CleanSheetName(text);
            expect(actualText).toContain('©');
            expect(actualText).toContain('𝌆');
            expect(actualText).toContain('☃');
            expect(actualText).toContain('>');
            expect(actualText).toContain('<');
            expect(actualText).toContain('"');
        });

        it("It is possible to get the valid file name", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var actualText = CleanExcelFileName(text);
            expect(actualText).toContain('©');
            expect(actualText).toContain('𝌆');
            expect(actualText).toContain('☃');
            expect(actualText).not.toContain('>');
            expect(actualText).not.toContain('<');
            expect(actualText).not.toContain('"');
        });

        it("It is a valid sheet name", function () {
            var sheetname = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var actual = IsValidSheetName(sheetname);
            expect(actual).toEqual(true);
        });

        it("It is not a valid sheet name", function () {
            var sheetname = '. Foo [ ] * / \ ? : bar 𝌆 baz ☃ qux > < "';
            var actual = IsValidSheetName(sheetname);

            expect(actual).toEqual(false);
        });

        it("It is a valid file name", function () {
            var sheetname = 'Foo bar should be valid';
            var actual = IsValidFileName(sheetname);
            expect(actual).toEqual(true);
        });

        it("It is not a valid file name", function () {
            var sheetname = '. Foo [ ] * / \ ? : bar 𝌆 baz ☃ qux > < "';
            var actual = IsValidFileName(sheetname);

            expect(actual).toEqual(false);
        });


    });

    describe("call ToArray", function () {

        it("should get empty array if parse fail", function () {
            var result1 = WC.Utility.ToArray();
            var result2 = WC.Utility.ToArray('test');
            var result3 = WC.Utility.ToArray(false);

            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
            expect(result3).toEqual([]);
        });

        it("should get expecting array", function () {
            var result = WC.Utility.ToArray([1,2]);

            expect(result).toEqual([1, 2]);
        });

    });

    describe("call ToNumber", function () {

        it("should get expecting number if parse success", function () {
            var result1 = WC.Utility.ToNumber('50.2');
            var result2 = WC.Utility.ToNumber('10,000');

            expect(result1).toEqual(50.2);
            expect(result2).toEqual(10000);
        });

        it("should get fallback number if parse fail", function () {
            var result1 = WC.Utility.ToNumber('xx');
            var result2 = WC.Utility.ToNumber(null, 1);
            var result3 = WC.Utility.ToNumber(undefined, 100);

            expect(result1).toEqual(0);
            expect(result2).toEqual(1);
            expect(result3).toEqual(100);
        });

    });

    describe("call ToBoolean", function () {

        it("should get true", function () {
            var result1 = WC.Utility.ToBoolean('test');
            var result2 = WC.Utility.ToBoolean(1);
            var result3 = WC.Utility.ToBoolean(true);

            expect(result1).toEqual(true);
            expect(result2).toEqual(true);
            expect(result3).toEqual(true);
        });

        it("should get false", function () {
            var result1 = WC.Utility.ToBoolean();
            var result2 = WC.Utility.ToBoolean(0);
            var result3 = WC.Utility.ToBoolean(false);

            expect(result1).toEqual(false);
            expect(result2).toEqual(false);
            expect(result3).toEqual(false);
        });

    });

    describe("call ConvertFieldName", function () {

        var tests = [
            { input: 'xx@xx@xx', expected: 'xxOatOxxOatOxx' },
            { input: 'xx-xx-xx', expected: 'xxOdashOxxOdashOxx' },
            { input: 'xx/xx/xx', expected: 'xxOslashOxxOslashOxx' },
            { input: 'xx\\xx\\xx', expected: 'xxObackslashOxxObackslashOxx' },
            { input: 'xx$xx$xx', expected: 'xxOdollarOxxOdollarOxx' },
            { input: 'xx§xx§xx', expected: 'xxOsectionOxxOsectionOxx' },
            { input: 'xxÂxxÂxx', expected: 'xxOacircumflexOxxOacircumflexOxx' }
        ];

        $.each(tests, function (index, test) {
            it("should convert '" + test.input + "' -> '" + test.expected + "'", function () {
                var result = WC.Utility.ConvertFieldName(test.input);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe("call RevertFieldName", function () {

        var tests = [
            { input: 'xxOatOxxOatOxx', expected: 'xx@xx@xx' },
            { input: 'xxOdashOxxOdashOxx', expected: 'xx-xx-xx' },
            { input: 'xxOslashOxxOslashOxx', expected: 'xx/xx/xx' },
            { input: 'xxObackslashOxxObackslashOxx', expected: 'xx\\xx\\xx' },
            { input: 'xxOdollarOxxOdollarOxx', expected: 'xx$xx$xx' },
            { input: 'xxOsectionOxxOsectionOxx', expected: 'xx§xx§xx' },
            { input: 'xxOacircumflexOxxOacircumflexOxx', expected: 'xxÂxxÂxx' }
        ];

        $.each(tests, function (index, test) {
            it("should revert '" + test.input + "' -> '" + test.expected + "'", function () {
                var result = WC.Utility.RevertFieldName(test.input);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe("call RevertBackSlashFieldName", function () {

        it("should revert and escape backslash 'xxObackslashOxxObackslashOxx' -> 'xx\\\\xx\\\\xx'", function () {
            var result = WC.Utility.RevertBackSlashFieldName('xxObackslashOxxObackslashOxx');
            expect('xx\\\\xx\\\\xx').toEqual(result);
        });

    });

});
