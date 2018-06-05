/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/ListFormatSettingHandler.js" />

describe("ListFormatSettingHandler", function () {

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(listFormatSettingHandler).toBeDefined();
        });
    });

    describe("call AddUseDefaulToFormatList", function () {
        var formatList;
        var enumFormatList = [{
            Text: 'Sort Name',
            Value: 'shn'
        }];

        beforeEach(function () {
            formatList = [{
                Text: 'Test',
                Value: 'test'
            }];
        });

        it("when undefined format, should not add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('', formatList);
            expect(formatList.length).toEqual(1);
        });

        it("when formatList is enum, should add default value to list", function () {
            enumFormatList = listFormatSettingHandler.AddUseDefaulToFormatList('enumerated', enumFormatList);
            expect(enumFormatList[0].Value).toEqual('usedefault');
        });

        it("when formatList is integer, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('int', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is double, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('double', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is time, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('time', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is datetime, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('datetime', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is currency, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('currency', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is percentage, should add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('percentage', formatList);
            expect(formatList[0].id).toEqual('usedefault');
        });

        it("when formatList is other type, should not add default value to list", function () {
            formatList = listFormatSettingHandler.AddUseDefaulToFormatList('text', formatList);
            expect(formatList.length).toEqual(1);
        });
    });
});

