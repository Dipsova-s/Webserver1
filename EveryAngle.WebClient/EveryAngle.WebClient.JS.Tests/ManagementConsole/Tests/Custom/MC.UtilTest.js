describe("MC.util", function () {

    var getOffsetText = function (offset) {
        return 'UTC' + (offset <= 0 ? '+' : '') + (-1 * offset / 60);
    };
    var getTimeFromOffset = function (offset) {
        var hour = -1 * offset / 60;
        return kendo.toString(hour, '00') + ':00';
    };
    var ScheduleTimeZoneForTest = {
        'W. Europe Standard Time': { 'abbr': 'CET', 'name': 'Europe/Berlin'},
        'India Standard Time': { 'abbr': 'IST', 'name': 'Asia/Calcutta' }
    }

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

        let offset1 = kendo.date.today().getTimezoneOffset();
        let name1 = jstz.determine().name();
        let scheduleTimeZone1 = (kendo.timezone.windows_zones.findObject('zone', name1) || { other_zone: '' }).other_zone;
        var tests = [
            { offset: offset1, unixtime: 0, utc: false, expected: '00:00' },
            { offset: offset1, unixtime: 0, utc: true, expected: '00:00' },
            { offset: offset1, unixtime: 3600, utc: true, expected: '01:00' }
        ];

        $.each(tests, function (index, test) {
            it("should convert unixtime to time picker time" , function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = scheduleTimeZone1;
                var result = MC.util.unixtimeToTimePicker(test.unixtime, test.utc);
                expect(test.expected).toEqual(kendo.toString(result, 'HH:mm'));
            });
        });

    });

    describe(".timePickerToUnixTime", function () {
        var tests = [
            { offset: 0, date: new Date(1970, 0, 1, 0, 0, 0), expected: 0 },
            { offset: 0, date: new Date(1970, 0, 1, 1, 0, 0), expected: 3600 }
        ];

        $.each(tests, function (index, test) {
            it("should convert time picker to unixtime", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = test.scheduleTimeZone;
                var result = MC.util.timePickerToUnixTime(test.date);
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

    describe(".getDisplayTimeForGrid", function () {
        // current location offset
        let offset2 = kendo.date.today().getTimezoneOffset();
        let name2 = jstz.determine().name();
        let scheduleTimeZone2 = (kendo.timezone.windows_zones.findObject('zone', name2) || { other_zone: '' }).other_zone

        var tests = [
            // null
            { seconds: null, offset: offset2, scheduleTimeZone: scheduleTimeZone2, isLog: false, expected: '' },

            // same location
            { seconds: 0, offset: offset2, scheduleTimeZone: scheduleTimeZone2, isLog: false, expected: '00:00' },

            // same location
            { seconds: 0, offset: offset2, scheduleTimeZone: scheduleTimeZone2, isLog: false, expected: ' [' },

            // different location
            { seconds: 8100, offset: -600, scheduleTimeZone: 'AUS Eastern Standard Time', isLog: false, expected: '<sup>-1</sup>]' },

            // with date
            { seconds: 0, offset: offset2, scheduleTimeZone: scheduleTimeZone2, isLog: true, expected: '01/01/1970' },
        ];

        $.each(tests, function (index, test) {
            it("should display time in schedule time zone and user time zone for Grid", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = test.scheduleTimeZone;
                expect(window.scheduleTimeZone + ':' + test.scheduleTimeZone + ':' + name2).toEqual(test.expected);
                var result = MC.util.getDisplayTimeForGrid(test.seconds, test.isLog);
                if (test.expected === '') {
                    expect(test.expected).toEqual(result);
                }
                else if (test.expected === ' [') {
                    expect(result).not.toContain(test.expected);
                }
                else {
                    expect(result).toContain(test.expected);
                }
            });
        });

    });

    describe(".getDisplayTime", function () {
        // current location offset
        let offset3 = kendo.date.today().getTimezoneOffset();
        let name3 = jstz.determine().name();
        let scheduleTimeZone3 = (kendo.timezone.windows_zones.findObject('zone', name3) || { other_zone: '' }).other_zone

        var tests = [
            // null
            { seconds: null, offset: offset3, scheduleTimeZone: scheduleTimeZone3, isLog: false, expected: '' },

            // same location
            { seconds: 0, offset: offset3, scheduleTimeZone: scheduleTimeZone3, isLogin: false, expected: ' ' + ScheduleTimeZoneForTest[scheduleTimeZone3].abbr },

            // same location
            { seconds: 0, offset: offset3, scheduleTimeZone: scheduleTimeZone3, isLogin: false, expected: ' [' },

            // same location
            { seconds: 0, offset: offset3, scheduleTimeZone: scheduleTimeZone3, isLogin: true, expected: ' [' },

            // different location
            { seconds: 0, offset: -600, scheduleTimeZone: 'AUS Eastern Standard Time', isLogin: false, expected: 'AET [' },

            // different location
            { seconds: 8100, offset: -600, scheduleTimeZone: 'AUS Eastern Standard Time', isLogin: false, expected: '<sup>-1</sup>' },
        ];

        $.each(tests, function (index, test) {
            it("should display time in schedule time zone and user time zone", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = test.scheduleTimeZone;
                var result = MC.util.getDisplayTime(test.seconds, test.isLogin);
                if (test.expected === '') {
                    expect(test.expected).toEqual(result);
                }
                else if (test.expected === ' [') {
                    expect(result).not.toContain(test.expected);
                }
                else
                {
                    expect(result).toContain(test.expected);
                }
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

    describe(".showInnoweraDetails", function () {
        var expected = [
            '<span data-role=\"tooltip\" data-tooltip-text=\"MM02/MM02_Plant\">',
            'MM02/MM02_Plant',
            '</span><br>',
            '<span data-role=\"tooltip\" data-tooltip-text=\"GX0K/GX0K_Material\">',
            'GX0K/GX0K_Material',
            '</span><br>'
        ].join('');

        beforeEach(function () {
            element = $('<div id=\"InnoweraInfoSection\"/>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should show innowera details when exist", function () {
            var fileData = {
                HasInnoweraProcess: true,
                InnoweraProcessDetails: [
                    {
                        SapProcessName: "MM02",
                        DisplayName: "MM02_Plant"
                    },
                    {
                        SapProcessName: "GX0K",
                        DisplayName: "GX0K_Material"
                    }
                ]
            };
            var e = {
                sender: {
                    dataItem: function () { return fileData }
                }
            };

            MC.util.showInnoweraDetails(e);

            expect(element.html()).toEqual(expected);
        });

        it("should not show innowera details when not exist", function () {
            var fileData = {
                is_innowera: false
            };

            var e = {
                sender: {
                    dataItem: function () { return fileData }
                }
            };

            MC.util.showInnoweraDetails(e);

            expect(element.html()).toEqual('');
        });
    });

    describe(".showExistTemplateInfo", function () {
        var element;

        beforeEach(function () {
            element = $('<span class=\"exist-template\"/>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should show warning when template not exist", function () {
            var fileData = {};
            var e = {
                sender: {
                    dataItem: function () { return fileData }
                }
            };

            MC.util.showExistTemplateInfo(e);

            expect(element.text()).toEqual(Captions.Label_Template_Not_Exist_Message);
        });

        it("should not show warning when template exist", function () {
            var fileData = {
                Uri: 'system/files?fileType=ExcelTemplate&name=EveryAngle-Standard.xlsx'
            };
            var e = {
                sender: {
                    dataItem: function () { return fileData }
                }
            };

            MC.util.showExistTemplateInfo(e);

            expect(element.html()).toEqual('');
        });
    });

    describe(".getTimezoneText", function () {
        // current location offset
        let offset4 = kendo.date.today().getTimezoneOffset();
        let name4 = jstz.determine().name();
        let scheduleTimeZone4 = (kendo.timezone.windows_zones.findObject('zone', name4) || { other_zone: '' }).other_zone

        var tests = [
            // same location
            { offset: offset4, scheduleTimeZone: scheduleTimeZone4, expected: ScheduleTimeZoneForTest[scheduleTimeZone4].name },

            // same location
            { offset: offset4, scheduleTimeZone: scheduleTimeZone4, expected: ' [' },

            // different location
            { offset: -600, scheduleTimeZone: 'AUS Eastern Standard Time', expected: 'Australia/Sydney' }
        ];

        $.each(tests, function (index, test) {
            it("Should return expected tooltip", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = test.scheduleTimeZone;
                var result = MC.util.getTimezoneText();
                if (test.expected === ' [') {
                    expect(result).not.toContain(test.expected);
                }
                else {
                    expect(result).toContain(test.expected);
                }
            });
        });

    });

    describe(".getTimezoneColumnName", function () {
        // current location offset
        let offset5 = kendo.date.today().getTimezoneOffset();
        let name5 = jstz.determine().name();
        let scheduleTimeZone5 = (kendo.timezone.windows_zones.findObject('zone', name5) || { other_zone: '' }).other_zone

        var tests = [
            // same location
            { offset: offset5, scheduleTimeZone: scheduleTimeZone5, expected: ScheduleTimeZoneForTest[scheduleTimeZone5].abbr },

            // same location
            { offset: offset5, scheduleTimeZone: scheduleTimeZone5, expected: ' [' },

            // different location
            { offset: -600, scheduleTimeZone: 'AUS Eastern Standard Time', expected: 'AET [' }
        ];

        $.each(tests, function (index, test) {
            it("Should return expected column name", function () {
                window.timezoneOffset = test.offset;
                window.timezoneOffsetWithDst = test.offset;
                window.scheduleTimeZone = test.scheduleTimeZone;
                var result = MC.util.getTimezoneColumnName();
                if (test.expected === ' [') {
                    expect(result).not.toContain(test.expected);
                }
                else {
                    expect(result).toContain(test.expected);
                }
            });
        });

    });
});