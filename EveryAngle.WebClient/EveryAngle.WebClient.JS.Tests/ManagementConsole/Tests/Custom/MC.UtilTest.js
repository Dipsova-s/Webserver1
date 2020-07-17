describe("MC.util", function () {

    var getOffsetText = function (offset) {
        return 'UTC' + (offset <= 0 ? '+' : '') + (-1 * offset / 60);
    };
    var getTimeFromOffset = function (offset) {
        var hour = -1 * offset / 60;
        return kendo.toString(hour, '00') + ':00';
    };

    describe(".download", function () {
        it("should download with iframe", function () {
            spyOn(MC.util, 'getDownloadUrl').and.returnValue('test.pdf');
            spyOn($.fn, 'on').and.returnValue($());
            spyOn($.fn, 'attr').and.returnValue($());
            spyOn($.fn, 'appendTo').and.returnValue($());
            MC.util.download('test.pdf', true);

            expect($.fn.on).toHaveBeenCalled();
            expect($.fn.attr).toHaveBeenCalledWith('src', 'test.pdf');
            expect($.fn.appendTo).toHaveBeenCalledWith('body');
        });
    });

    describe(".getDownloadUrl", function () {
        beforeEach(function () {
            spyOn(ValidationRequestService, 'getVerificationTokenAsQueryString').and.returnValue('request_verification_token=my-secret-key');
        });
        it("should get download url with token (url=test.pdf)", function () {
            var url = 'test.pdf';
            var result = MC.util.getDownloadUrl(url);
            expect(result).toEqual('test.pdf?request_verification_token=my-secret-key');
        });
        it("should get download url with token (url=test.pdf?param=value)", function () {
            var url = 'test.pdf?param=value';
            var result = MC.util.getDownloadUrl(url);
            expect(result).toEqual('test.pdf?param=value&request_verification_token=my-secret-key');
        });
    });

    describe(".setWindowTitle", function () {
        it("should set window title correctly", function () {
            var currentTitle = document.title;
            var newTitle = 'table couplings';

            MC.util.setWindowTitle(newTitle);
            expect(document.title).toEqual(newTitle);

            MC.util.setWindowTitle(currentTitle);
            expect(document.title).toEqual(currentTitle);
        });
    });

    describe(".encodeHtml", function () {
        var tests = [
            { html: '<div class="test">test1 > test2</div>', expected: '&lt;div class=&quot;test&quot;&gt;test1 &gt; test2&lt;/div&gt;' },
            { html: 'I\'m a developer, "Gaj"', expected: 'I&#39;m a developer, &quot;Gaj&quot;' }
        ];

        $.each(tests, function (index, test) {
            it("should encode html (" + test.html + " -> " + test.expected + ")", function () {
                var result = MC.util.encodeHtml(test.html);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".getController", function () {

        window.normalFunction = $.noop;
        window.deepFunction = { level1: { level2: $.noop } };

        var tests = [
            { input: null, expected: $.noop },
            { input: 1, expected: $.noop },
            { input: 'MC.util', expected: $.noop },
            { input: 'MC.util2.encodeHtml', expected: $.noop },
            { input: 'normalFunction', expected: normalFunction },
            { input: 'deepFunction.level1.level2', expected: deepFunction.level1.level2 }
        ];

        $.each(tests, function (index, test) {
            it("should convert input to function (" + test.input + " -> " + test.expected + ")", function () {
                var result = MC.util.getController(test.input);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".unixtimeToTimePicker", function () {

        var currentOffset = kendo.date.today().getTimezoneOffset();
        var tests = [
            // expected = currentOffset - (unixtime / 60)
            { offset: 0, unixtime: 0, utc: false, expected: getTimeFromOffset(currentOffset) },
            { offset: 0, unixtime: 0, utc: true, expected: '00:00' },
            { offset: 0, unixtime: 3600, utc: true, expected: '01:00' }
        ];

        $.each(tests, function (index, test) {
            it("should convert unixtime to time picker (" + test.unixtime + " -> " + test.expected + (test.utc ? " UTC" : " LOCAL") + ")", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                var result = MC.util.unixtimeToTimePicker(test.unixtime, test.utc);
                expect(test.expected).toEqual(kendo.toString(result, 'HH:mm'));
            });
        });

    });

    describe(".timePickerToUnixTime", function () {
        var tests = [
            { offset: 0, date: new Date(1970, 0, 1, 0, 0, 0), utc: true, expected: 0 },
            { offset: 0, date: new Date(1970, 0, 1, 1, 0, 0), utc: true, expected: 3600 }
        ];

        $.each(tests, function (index, test) {
            it("should time picker to unixtime (" + getOffsetText(test.offset) + ", " + kendo.toString(test.date, 'HH:mm') + (test.utc ? " UTC" : " Local") + " -> " + test.expected + ")", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                var result = MC.util.timePickerToUnixTime(test.date, test.utc);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe(".getDisplayTimeUTC", function () {

        var tests = [
            { seconds: null, expected: '' },
            { seconds: 0, expected: '00:00' },
            { seconds: 82800, expected: '23:00' }
        ];

        $.each(tests, function (index, test) {
            it("should display time as UTC (" + test.seconds + " -> " + test.expected + ")", function () {
                var result = MC.util.getDisplayTimeUTC(test.seconds);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".getDisplayTimeLocal", function () {
        // currecnt location offset
        var offset = kendo.date.today().getTimezoneOffset();

        var tests = [
            // null
            { seconds: null, offset: offset, expected: '' },

            // same location
            { seconds: 0, offset: offset, expected: '00:00' },

            // difference location
            { seconds: 0, offset: -480, expected: '00:00' }
        ];

        $.each(tests, function (index, test) {
            it("should display time as local (server " + getOffsetText(test.offset) + ", " + test.seconds + " -> " + test.expected + ")", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                var result = MC.util.getDisplayTimeLocal(test.seconds);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".dateStringToTimestamp", function () {

        var tests = [
            { testcase: 'should return timestamp correctly, when is not null', input: '2019-04-02T07:41:11', isNull: false },
            { testcase: 'should return null, when is empty', input: '', isNull: true },
            { testcase: 'should return null, when is null', input: null, isNull: true }
        ];

        $.each(tests, function (index, test) {
            it(test.testcase, function () {
                var result = MC.util.dateStringToTimestamp(test.input);
                test.isNull ? expect(result).toBeNull() : expect(result).not.toBeNull();
            });
        });

    });
});