/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />

describe("DataType", function () {

    var formatHelper;

    beforeEach(function () {
        formatHelper = new FormatHelper();
    });


    describe("when format helper create new instance", function () {
        it("should be defined", function () {
            expect(formatHelper).toBeDefined();
        });
    });

    describe("call GetFormattedValue", function () {
        var value = 1234567890.00;
        var customCulture = $.extend({}, ko.toJS(kendo.culture()));
        customCulture.calendar.AM = ["am", "am", "AM"];
        customCulture.calendar.PM = ["pm", "pm", "PM"];
        var formatOptions;

        beforeEach(function () {
            formatOptions = {};
        });

        it("should generate general format", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 2;
            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.NUMBER);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1,234,567,890.00');
        });

        it("should generate number format with thousands unit", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 3;
            formatOptions.prefix = "K";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.NUMBER);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1,234,567.890 K');
        });

        it("should generate number format with millions unit", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 3;
            formatOptions.prefix = "M";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.NUMBER);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1,234.568 M');
        });

        it("should generate currency format with speparator", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 3;
            formatOptions.prefix = 'K';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
            format.format = 'GBP';
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1,234,567.890 K GBP');
        });

        it("should generate currency format without separator", function () {

            formatOptions.thousandseparator = false;
            formatOptions.decimals = 3;
            formatOptions.prefix = 'K';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
            format.format = 'GBP';
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1234567.890 K GBP');
        });

        it("should generate currency format with 1 decimal", function () {

            formatOptions.thousandseparator = false;
            formatOptions.decimals = 1;
            formatOptions.prefix = 'N';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
            format.format = 'GBP';
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1234567890.0 GBP');
        });

        it("should generate currency format with MYR", function () {

            formatOptions.thousandseparator = false;
            formatOptions.decimals = 3;
            formatOptions.prefix = null;

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
            format.format = 'MYR';
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1234567890.000 MYR');
        });

        it("should generate currency format with KRW", function () {

            formatOptions.thousandseparator = false;
            formatOptions.decimals = 3;
            formatOptions.prefix = null;

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.CURRENCY);
            format.format = 'KRW';
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('1234567890.000 KRW');
        });

        it("should generate percentage format with separator", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 3;
            formatOptions.prefix = 'K';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.PERCENTAGE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('123,456,789.000 K %');
        });

        it("should generate percentage format without separator", function () {

            formatOptions.thousandseparator = false;
            formatOptions.decimals = 3;
            formatOptions.prefix = 'K';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.PERCENTAGE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('123456789.000 K %');
        });

        it("should generate percentage format with 0 decimal", function () {

            formatOptions.thousandseparator = true;
            formatOptions.decimals = 0;
            formatOptions.prefix = 'K';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.PERCENTAGE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('123,456,789 K %');
        });

        it("should generate date format with dash separator", function () {
            value = new Date(2016, 7, 11);
            formatOptions.order = "MDY";
            formatOptions.day = "dd";
            formatOptions.month = "MMM";
            formatOptions.year = "yyyy";
            formatOptions.datedelimiter = "-";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.DATE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('Aug-11-2016');
        });

        it("should generate date format with short year", function () {
            value = new Date(2016, 7, 11);
            formatOptions.order = "MDY";
            formatOptions.day = "dd";
            formatOptions.month = "MMM";
            formatOptions.year = "yy";
            formatOptions.datedelimiter = "/";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.DATE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('Aug/11/16');
        });

        it("should generate date format with short month", function () {
            value = new Date(2016, 7, 11);
            formatOptions.order = "MDY";
            formatOptions.day = "dd";
            formatOptions.month = "MM";
            formatOptions.year = "yy";
            formatOptions.datedelimiter = "/";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.DATE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('08/11/16');
        });

        it("should generate date format with year month day order", function () {
            value = new Date(2016, 7, 11);
            formatOptions.order = "YMD";
            formatOptions.day = "dd";
            formatOptions.month = "MM";
            formatOptions.year = "yyyy";
            formatOptions.datedelimiter = "/";

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.DATE);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('2016/08/11');
        });

        it("should generate time format with am/pm", function () {
            value = new Date(2016, 7, 11, 12,30);
            formatOptions.hour = 'hmm';
            formatOptions.timedelimiter = '.';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.TIME);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('12.30 pm');
        });

        it("should generate time format with 24 hour", function () {
            value = new Date(2016, 7, 11, 12, 30);
            formatOptions.hour = "HHmm";
            formatOptions.timedelimiter = '.';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.TIME);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('12.30');
        });

        it("should generate time format with semicolon separator", function () {
            value = new Date(2016, 7, 11, 12, 30);
            formatOptions.hour = "HHmm";
            formatOptions.timedelimiter = ':';

            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.TIME);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('12:30');
        });

        it("should generate set format with short name and long name", function () {
            value = {
                short_name: '100',
                long_name: 'IDES AG',
                id: 'id'
            };

            formatOptions.format = "shnln";
            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.ENUM);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('100 (IDES AG)');
        });

        it("should generate set format with short name", function () {
            value = {
                short_name: '100',
                long_name: 'IDES AG',
                id: 'id'
            };

            formatOptions.format = "shn";
            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.ENUM);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('100');
        });

        it("should generate set format with long name", function () {
            value = {
                short_name: '100',
                long_name: 'IDES AG',
                id: 'id'
            };

            formatOptions.format = "ln";
            var format = new Formatter(formatOptions, enumHandlers.FIELDTYPE.ENUM);
            var newValue = WC.FormatHelper.GetFormattedValue(format, value, false, customCulture);

            expect(newValue).toEqual('IDES AG');
        });
    });

    describe("call IsFieldTypeHasTime", function () {

        it("type time should be true", function () {
            var fieldType = enumHandlers.FIELDTYPE.TIME;
            var isTime = WC.FormatHelper.IsFieldTypeHasTime(fieldType);
            expect(isTime).toEqual(true);
        });

        it("type timespan should be true", function () {
            var fieldType = enumHandlers.FIELDTYPE.TIMESPAN;
            var isTime = WC.FormatHelper.IsFieldTypeHasTime(fieldType);
            expect(isTime).toEqual(true);
        });

        it("type currency should be false", function () {
            var fieldType = enumHandlers.FIELDTYPE.CURRENCY;
            var isTime = WC.FormatHelper.IsFieldTypeHasTime(fieldType);
            expect(isTime).toEqual(false);
        });
    });

    describe("call IsIntegerBucket", function () {

        it("should depend on IsIntegerType function if no bucket", function () {
            spyOn(dataTypeModel, 'IsIntegerType').and.callFake(function () { return true; });
            var result = dataTypeModel.IsIntegerBucket('', 'int');
            expect(result).toEqual(true);
        });

        it("should be true if count bucket", function () {
            var result = dataTypeModel.IsIntegerBucket('count', 'double');
            expect(result).toEqual(true);
        });

        it("should be true if not count and average bucket but int type", function () {
            spyOn(dataTypeModel, 'IsIntegerType').and.callFake(function () { return true; });
            var result = dataTypeModel.IsIntegerBucket('sum', 'int');
            expect(result).toEqual(true);
        });

        it("should be false if not count and not IsIntegerType", function () {
            spyOn(dataTypeModel, 'IsIntegerType').and.callFake(function () { return false; });
            var result = dataTypeModel.IsIntegerBucket('sum', 'double');
            expect(result).toEqual(false);
        });

    });

    describe("call IsIntegerType", function () {

        it("should be true if int", function () {
            var result = dataTypeModel.IsIntegerType('int');
            expect(result).toEqual(true);
        });

        it("should be true if period", function () {
            var result = dataTypeModel.IsIntegerType('period');
            expect(result).toEqual(true);
        });

        it("should be false if not int or period", function () {
            var result = dataTypeModel.IsIntegerType('double');
            expect(result).toEqual(false);
        });

    });

    describe("call GetCorrectDataType", function () {

        it("should be text if IsTextDataType #1", function () {
            var fieldType = dataTypeModel.GetCorrectDataType('individual', 'text');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.TEXT);
        });

        it("should be text if IsTextDataType #2", function () {
            var fieldType = dataTypeModel.GetCorrectDataType('left3_xx', 'enumerated');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.TEXT);
        });

        it("should be int if IsIntegerBucket and not period", function () {
            spyOn(dataTypeModel, 'IsIntegerBucket').and.callFake(function () { return true; });
            var fieldType = dataTypeModel.GetCorrectDataType('count', 'double');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.INTEGER);
        });

        it("should be int if IsIntegerBucket and period", function () {
            spyOn(dataTypeModel, 'IsIntegerBucket').and.callFake(function () { return true; });
            var fieldType = dataTypeModel.GetCorrectDataType('count_valid', 'period');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.INTEGER);
        });

        it("should be double if not IsIntegerBucket but IsIntegerType", function () {
            spyOn(dataTypeModel, 'IsIntegerBucket').and.callFake(function () { return false; });
            spyOn(dataTypeModel, 'IsIntegerType').and.callFake(function () { return true; });
            var fieldType = dataTypeModel.GetCorrectDataType('average', 'int');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.DOUBLE);
        });

        it("should do nothing if not IsIntegerBucket and not IsIntegerType", function () {
            spyOn(dataTypeModel, 'IsIntegerBucket').and.callFake(function () { return false; });
            spyOn(dataTypeModel, 'IsIntegerType').and.callFake(function () { return false; });
            var fieldType = dataTypeModel.GetCorrectDataType('average', 'currency');
            expect(fieldType).toEqual(enumHandlers.FIELDTYPE.CURRENCY);
        });

    });

    describe("call GetCorrectPrefix", function () {

        it("when not have display unit, display unit will not change", function () {
            var result = dataTypeModel.GetCorrectPrefix('', '');
            expect(result).toEqual('');
        });

        it("when none display unit, display unit will not change", function () {
            var result = dataTypeModel.GetCorrectPrefix(enumHandlers.DISPLAYUNITSFORMAT.NONE, '');
            expect(result).toEqual(enumHandlers.DISPLAYUNITSFORMAT.NONE);
        });

        it("when it was in prefix list, display unit will not change #1", function () {
            var bucketValue = 'xxx';
            var result = dataTypeModel.GetCorrectPrefix('K', bucketValue);
            expect(result).toEqual('K');
        });

        it("when it was in prefix list, display unit will not change #2", function () {
            var bucketValue = 'power10_3';
            var result = dataTypeModel.GetCorrectPrefix('K', bucketValue);
            expect(result).toEqual('K');
        });

        it("when it was in prefix list, display unit will not change #3", function () {
            var bucketValue = 'power10_9';
            var result = dataTypeModel.GetCorrectPrefix('M', bucketValue);
            expect(result).toEqual('M');
        });

        it("when it was not in prefix list, display unit will change #1", function () {
            var bucketValue = 'power10_min2';
            var result = dataTypeModel.GetCorrectPrefix('K', bucketValue);
            expect(result).toEqual('N');
        });

        it("when it was not in prefix list, display unit will change #1", function () {
            var bucketValue = 'power10_2';
            var result = dataTypeModel.GetCorrectPrefix('K', bucketValue);
            expect(result).toEqual('N');
        });

        it("when it was not in prefix list, display unit will change #2", function () {
            var bucketValue = 'power10_5';
            var result = dataTypeModel.GetCorrectPrefix('M', bucketValue);
            expect(result).toEqual('K');
        });
    });

    describe("call GetWeekOfYear", function () {

        var tests = [
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 52, y: 2015 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 53, y: 2015 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 1, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 1, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 1, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 52, y: 2015 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2015, m: 11, d: 31 }, expected: { w: 52, y: 2015 } },

            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Sunday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 1, y: 2018 } },

            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 52, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Monday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 52, y: 2017 } },

            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 53, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 53, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Tuesday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 52, y: 2017 } },

            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 53, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 53, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 53, y: 2016 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 51, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Wednesday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 52, y: 2017 } },

            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 53, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 53, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 53, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Thursday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 53, y: 2017 } },

            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 1, y: 2018 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 1, y: 2018 } },
            { dow: enumHandlers.DAYOFWEEK.Friday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 1, y: 2018 } },

            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 01 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 02 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 03 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 04 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 05 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 06 }, expected: { w: 1, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 07 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 0, d: 08 }, expected: { w: 2, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 24 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 25 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 26 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 27 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 28 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 29 }, expected: { w: 52, y: 2017 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 30 }, expected: { w: 1, y: 2018 } },
            { dow: enumHandlers.DAYOFWEEK.Saturday, value: { y: 2017, m: 11, d: 31 }, expected: { w: 1, y: 2018 } }
        ];

        $.each(tests, function (index, test) {
            it("First day of week : " + test.dow + ", " + test.value.y + '/' + test.value.m + '/' + test.value.d + ' --> ' + test.expected.w + '/' + test.expected.y, function () {
                var date = new Date(test.value.y, test.value.m, test.value.d);
                var result = formatHelper.GetWeekOfYear(test.dow, date, 'yyyy');
                result.y = parseInt(result.y);
                expect(test.expected).toEqual(result);
            });
        });
    });
});