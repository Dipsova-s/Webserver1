describe('MC.util.modelserverinfo', function () {

    var modelServerInfo = MC.util.modelServerInfo;

    describe('when create new instance', function () {
        it('should be defined', function () {
            expect(modelServerInfo).toBeDefined();
        });
    });

    describe('call convertMAFieldTypeToKendoFieldType', function () {
        var testCases = [{
            fieldType: '',
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.TEXT
        },
        {
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.TEXT,
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.TEXT
        },
        {
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.INT,
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.INT
        },
        {
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.FLOAT,
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.FLOAT
        },
        {
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.BOOL,
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.BOOL
        },
        {
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.TIME,
            expectedResult: modelServerInfo.KENDO_FIELD_TYPES.TIME
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
            fieldType: modelServerInfo.REPORT_FIELD_TYPES.TIME,
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
                type: modelServerInfo.REPORT_FIELD_TYPES.TIME,
                showmsecs: true
            },
            expectedResult: 'HH:mm:ss.fff'
        },
        {
            fieldData: {
                type: modelServerInfo.REPORT_FIELD_TYPES.FLOAT,
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
                type: modelServerInfo.REPORT_FIELD_TYPES.TIME,
                showmsecs: true
            },
            expectedResult: '{0:HH:mm:ss.fff}'
        },
        {
            fieldData: {
                type: modelServerInfo.REPORT_FIELD_TYPES.FLOAT,
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
