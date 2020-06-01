describe('MC.util.modelserverinfo', function () {

    var modelServerInfo;
    beforeEach(function () {
        modelServerInfo = MC.util.modelServerInfo;
    });

    describe('call convertMAFieldTypeToKendoFieldType', function () {
        var testCases = [{
            fieldType: '',
            expectedResult: 'string'
        },
        {
            fieldType: 'text',
            expectedResult: 'string'
        },
        {
            fieldType: 'int',
            expectedResult: 'number'
        },
        {
            fieldType: 'float',
            expectedResult: 'number'
        },
        {
            fieldType: 'bool',
            expectedResult: 'boolean'
        },
        {
            fieldType: 'time',
            expectedResult: 'date'
        }];
        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should convert to kendo field type by data type "{0}" correctlly', testCase.fieldType), function () {
                var actualResult = modelServerInfo.convertMAFieldTypeToKendoFieldType(testCase.fieldType);
                expect(testCase.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe('call convertFieldValueByReportFieldType', function () {
        var testCases = [{
            fieldType: '',
            fieldValue: 'test',
            expectedResult: 'test'
        },
        {
            fieldType: 'time',
            fieldValue: 1511201059.187,
            expectedResult: kendo.date.today()
        }];
        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should convert field value by data type "{0}" correctlly', testCase.fieldType), function () {
                spyOn(MC.util, 'unixtimeToTimePicker').and.callFake(function () {
                    return testCase.expectedResult;
                });
                var actualResult = modelServerInfo.convertFieldValueByReportFieldType(testCase.fieldType, testCase.fieldValue);
                expect(testCase.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe('call parseReportFieldTitle', function () {
        var testCases = [{
            fieldTitle: 'Test test test test test test',
            expectedResult: 'Testtesttesttesttesttest'
        }];
        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should parse field title by "{0}" correctlly', testCase.fieldTitle), function () {
                var actualResult = modelServerInfo.parseReportFieldTitle(testCase.fieldTitle);
                expect(testCase.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe('call getKendoFormatValueByReportFieldType', function () {
        var testCases = [{
            fieldData: {
                type: ''
            },
            expectedResult: ''
        },
        {
            fieldData: {
                type: 'time',
                showmsecs: true
            },
            expectedResult: 'HH:mm:ss.fff'
        },
        {
            fieldData: {
                type: 'float',
                decimals: 5
            },
            expectedResult: 'n5'
        }];
        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should get kendo format value by field type "{0}" correctlly', testCase.fieldData.type), function () {
                var actualResult = modelServerInfo.getKendoFormatValueByReportFieldType(testCase.fieldData);
                expect(testCase.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe('call getKendoFormatColumnValueByReportFieldType', function () {
        var testCases = [{
            fieldData: {
                type: ''
            },
            expectedResult: '{0}'
        },
        {
            fieldData: {
                type: 'time',
                showmsecs: true
            },
            expectedResult: '{0:HH:mm:ss.fff}'
        },
        {
            fieldData: {
                type: 'float',
                decimals: 5
            },
            expectedResult: '{0:n5}'
        }];
        jQuery.each(testCases, function (index, testCase) {
            it(kendo.format('should get kendo format column value by field type "{0}" correctlly', testCase.fieldData.type), function () {
                var actualResult = modelServerInfo.getKendoFormatColumnValueByReportFieldType(testCase.fieldData);
                expect(testCase.expectedResult).toEqual(actualResult);
            });
        });
    });

});
