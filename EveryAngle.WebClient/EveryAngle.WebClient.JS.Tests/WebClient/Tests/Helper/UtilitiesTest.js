describe("WC.Utility", function () {

    describe(".GUID", function () {

        it("should create the GUID", function () {
            expect(jQuery.GUID()).not.toBeUndefined();
        });

        it("should create the different of GUID", function () {
            var guid1 = jQuery.GUID();
            var guid2 = jQuery.GUID();
            var guid3 = jQuery.GUID();

            expect(guid1).not.toEqual(guid2);
            expect(guid2).not.toEqual(guid3);
            expect(guid1).not.toEqual(guid3);
        });

        it("must have 36 chars", function () {
            var expectLength = 36;
            var guid = jQuery.GUID();
            expect(guid.length).toEqual(expectLength);
        });

    });

    describe("htmlEncode", function () {

        it("should encode the html", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var encodedText = htmlEncode(text);
            expect(encodedText).not.toContain('©');
            expect(encodedText).not.toContain('𝌆');
            expect(encodedText).not.toContain('☃');
            expect(encodedText).not.toContain('>');
            expect(encodedText).not.toContain('<');
            expect(encodedText).not.toContain('"');
        });

        it("should have the valid words", function () {
            var text = 'Foo © bar 𝌆 baz ☃ qux > < "';
            var encodedText = htmlEncode(text);
            expect(encodedText).toContain('Foo');
            expect(encodedText).toContain('bar');
            expect(encodedText).toContain('baz');
            expect(encodedText).toContain('qux');
        });
    });

    describe("CleanSheetName", function () {

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
    });

    describe("IsValidSheetName", function () {
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

    describe(".ToArray", function () {

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

    describe(".ToNumber", function () {

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

    describe(".ToBoolean", function () {

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

    describe(".MatchAll", function () {
        it("should get true", function () {
            var result = WC.Utility.MatchAll('test', ['test', 'test', 'test', 'test']);
            expect(result).toEqual(true);
        });

        it("should get false", function () {
            var result = WC.Utility.MatchAll('test', ['test', 'test1', 'test', 'test']);
            expect(result).toEqual(false);
        });
    });

    describe(".ConvertFieldName", function () {

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

    describe(".RevertFieldName", function () {

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

    describe(".RevertBackSlashFieldName", function () {

        it("should revert and escape backslash 'xxObackslashOxxObackslashOxx' -> 'xx\\\\xx\\\\xx'", function () {
            var result = WC.Utility.RevertBackSlashFieldName('xxObackslashOxxObackslashOxx');
            expect('xx\\\\xx\\\\xx').toEqual(result);
        });

    });

    describe(".GetQueryStringValue", function () {
        
        var tests = [
            { url: 'http://example.com', name: 'test', expected: '' },
            { url: 'http://example.com?testxx=1&xxtest=2&test=3', name: 'test1', expected: '' },
            { url: 'http://example.com#/?testxx=1&xxtest=2&test=3', name: 'test', expected: '3' },
            { url: '?testxx=1&xxtest=2&test=3', name: 'testxx', expected: '1' },
            { url: '?testxx=1&xxtest=2&test=3', name: 'xxtest', expected: '2' },
            { url: '?testxx=1&xxtest=2&test=3', name: 'test', expected: '3' },
            { url: '?model=/models/1&id=EA_PROPERTY_DeliveryReliability', name: 'model', expected: '/models/1' }
        ];

        $.each(tests, function (index, test) {
            it("should get query string '" + test.name + "' of '" + test.url + "'", function () {
                var result = WC.Utility.GetQueryStringValue(test.url, test.name);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".IsAbsoluteUrl", function () {

        var tests = [
            { url: 'http://example.com', expected: true },
            { url: 'HTTP://EXAMPLE.COM/', expected: true },
            { url: 'https://www.exmaple.com', expected: true },
            { url: 'ftp://example.com/file.txt', expected: true },
            { url: '//cdn.example.com/lib.js', expected: true },
            { url: '/myfolder/test.txt', expected: false },
            { url: 'test', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should " + (test.expected ? 'be' : 'not be') + " an absolute url '" + test.url + "'", function () {
                var result = WC.Utility.IsAbsoluteUrl(test.url);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".MeasureText", function () {

        it("should not throw JS error when input number instead of string", function () {
            expect(function () {
                Modernizr.canvas = true;
                WC.Utility.MeasureText(1);
            }).not.toThrow();
        });

    });

    describe(".DownloadFile", function () {
        it("Should call RedirectUrl when useAnchor is undefined", function () {
            spyOn(WC.Utility, 'RedirectUrl');
            WC.Utility.DownloadFile('');
            expect(WC.Utility.RedirectUrl).toHaveBeenCalled();
        });
        it("Should call RedirectUrl when useAnchor is false", function () {
            spyOn(WC.Utility, 'RedirectUrl');
            WC.Utility.DownloadFile('', false);
            expect(WC.Utility.RedirectUrl).toHaveBeenCalled();
        });

        it("should download using anchor tag", function () {
            spyOn(WC.Utility, 'RedirectUrl');
            WC.Utility.DownloadFile('test.json', true);

            //Assert
            expect(WC.Utility.RedirectUrl).not.toHaveBeenCalled();
            expect($('.downloadUsingAnchor').length).toBe(1);
            expect($('.downloadUsingAnchor').attr('href')).toBeTruthy();
        });
    });

});

