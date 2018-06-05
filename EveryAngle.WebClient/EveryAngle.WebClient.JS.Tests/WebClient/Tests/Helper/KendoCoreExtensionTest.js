describe("kendo.core.extension test", function () {

    beforeEach(function () {
        window.textDays = 'days';
    });

    describe("call kendo.date.getTimeSpan", function () {

        var tests = [
            { value: 'test', expected: null },
            { value: 0, expected: { negative: false, days: 0, time: new Date(1970, 0, 1, 0, 0, 0) } },
            { value: 1, expected: { negative: false, days: 1, time: new Date(1970, 0, 1, 0, 0, 0) } },
            { value: -1, expected: { negative: true, days: 1, time: new Date(1970, 0, 1, 0, 0, 0) } },
            { value: 1.0416666666666667, expected: { negative: false, days: 1, time: new Date(1970, 0, 1, 1, 0, 0) } },
            { value: -1.0416666666666667, expected: { negative: true, days: 1, time: new Date(1970, 0, 1, 1, 0, 0) } }
        ];

        $.each(tests, function (index, test) {
            it("should convert number to timespan (" + test.value + " -> " + JSON.stringify(test.expected) + ")", function () {
                var result = kendo.date.getTimeSpan(test.value);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe("call kendo.date.toTimeSpan", function () {

        var tests = [
            { value: { negative: false, days: null, time: new Date(1970, 0, 1, 0, 0, 0) }, expected: null },
            { value: { negative: true, days: 0, time: null }, expected: null },
            { value: { negative: false, days: 0, time: new Date(1970, 0, 1, 0, 0, 0) }, expected: 0 },
            { value: { negative: false, days: 1, time: new Date(1970, 0, 1, 0, 0, 0) }, expected: 1 },
            { value: { negative: true, days: 1, time: new Date(1970, 0, 1, 0, 0, 0) }, expected: -1 },
            { value: { negative: false, days: 1, time: new Date(1970, 0, 1, 1, 0, 0) }, expected: 1.0416666666666667 },
            { value: { negative: true, days: 1, time: new Date(1970, 0, 1, 1, 0, 0) }, expected: -1.0416666666666667 }
        ];

        $.each(tests, function (index, test) {
            it("should convert timespan to number (" + JSON.stringify(test.value) + " -> " + test.expected + ")", function () {
                var result = kendo.date.toTimeSpan(test.value.days, test.value.time, test.value.negative);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe("call kendo.toString", function () {

        var tests = [
            { format: '[h]:mm', value: 0, expected: '0 days 00:00' },
            { format: '[h]:mm:ss', value: 0, expected: '0 days 00:00:00' },
            { format: '[h].mm', value: 0, expected: '0 days 00.00' },
            { format: '[h].mm.ss', value: 0, expected: '0 days 00.00.00' },
            { format: '[h]:mm:ss', value: 1, expected: '1 days 00:00:00' },
            { format: '[h]:mm:ss', value: -1, expected: '-1 days 00:00:00' },
            { format: '[h]:mm:ss', value: 1.0416666666666667, expected: '1 days 01:00:00' },
            { format: '[h]:mm:ss', value: -1.0416666666666667, expected: '-1 days 01:00:00' }
        ];

        $.each(tests, function (index, test) {
            it("should format \"" + test.format + "\" (" + test.value + " -> " + test.expected + ")", function () {
                var result = kendo.toString(test.value, test.format);

                expect(test.expected).toEqual(result);
            });
        });

    });

    describe("call kendo.format", function () {

        var tests = [
            { format: '{0:[h]:mm}', value: 0, expected: '0 days 00:00' },
            { format: '{0:[h]:mm:ss}', value: 0, expected: '0 days 00:00:00' },
            { format: '{0:[h].mm}', value: 0, expected: '0 days 00.00' },
            { format: '{0:[h].mm.ss}', value: 0, expected: '0 days 00.00.00' },
            { format: '{0:[h]:mm:ss}', value: 1, expected: '1 days 00:00:00' },
            { format: '{0:[h]:mm:ss}', value: -1, expected: '-1 days 00:00:00' },
            { format: '{0:[h]:mm:ss}', value: 1.0416666666666667, expected: '1 days 01:00:00' },
            { format: '{0:[h]:mm:ss}', value: -1.0416666666666667, expected: '-1 days 01:00:00' }
        ];

        $.each(tests, function (index, test) {
            it("should format \"" + test.format + "\" (" + test.value + " -> " + test.expected + ")", function () {
                var result = kendo.format(test.format, test.value);

                expect(test.expected).toEqual(result);
            });
        });

    });

});
