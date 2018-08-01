describe("MC.util.js", function () {

    var getOffsetText = function (offset) {
        return 'UTC' + (offset <= 0 ? '+' : '') + (-1 * offset / 60);
    };
    var getTimeFromOffset = function (offset) {
        var hour = -1 * offset / 60;
        return kendo.toString(hour, '00') + ':00';
    };

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(MC.util).toBeDefined();
        });

    });

    describe("MC.util.setWindowTitle", function () {
        it("should set window title correctly", function () {
            var currentTitle = document.title;
            var newTitle = 'table couplings';

            MC.util.setWindowTitle(newTitle);
            expect(document.title).toEqual(newTitle);

            MC.util.setWindowTitle(currentTitle);
            expect(document.title).toEqual(currentTitle);
        });
    });

    describe("MC.util.encodeHtml", function () {
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

    describe("MC.util.getController", function () {

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

    describe("MC.util.unixtimeToTimePicker", function () {

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

    describe("MC.util.timePickerToUnixTime", function () {
        
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

    describe("MC.util.getDisplayTimeUTC", function () {

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

    describe("MC.util.getDisplayTimeLocal", function () {
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

});