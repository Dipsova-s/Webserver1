/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Exports/ExportHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Exports/ExportExcelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/HtmlTemplate/Export/exportexcelhtmltemplate.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportCSVModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ChartHandler.js" />

describe("ExportHandlerTest", function () {

    var datastore;
    beforeEach(function () {
        datastore = {
            data_settings: {
                setting_list: [
                {
                    id: 'csv_enquote_headers',
                    value: false
                },
                {
                    id: 'csv_line_separator',
                    value: ''
                }]
            }
        };
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(exportHandler).toBeDefined();
        });
    });

    describe("call SetExportModel", function () {

        beforeEach(function () {
            exportHandler.CurrentExportModel = new ExportCSVModel({
                FileName: 'Test',
                DatarowUri: '/results/8/datarows',
                MaxPageSize: 1000,
                DisplayUri: '/models/1/angles/1/displays/1',
                FieldMetaDataUri: '',
                UserSettingUri: '/users/1/settings',
                ModelDataTimeStamp: 1475638829,
                DataFieldUri: '/models/1/instances/19/fields?classes=PurchaseOrderScheduleLine',
                CurrentFields: '',
                DisplayType: 'list'
            });
        });

        it("should set EnquoteHeader to Export Model", function () {
            var result = exportHandler.SetExportModel(datastore);
            expect(result.EnquoteHeader()).toBe(false);
        });
    });

    describe("call GetDatastoreDataSetting", function () {
        it("should set EnquoteHeader to Export Model", function () {
            var result = exportHandler.GetDatastoreDataSetting(datastore, 'csv_enquote_headers');
            expect(result).toBe(false);
        });
        it("when get not existing id, should return empty string", function () {
            var result = exportHandler.GetDatastoreDataSetting(datastore, 'test');
            expect(result).toBe('');
        });
    });

    describe("call CreateAddModelDateUI", function () {

        var element;

        beforeEach(function () {
            element = $('<div id="add-model-date-at-column" />').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should function exist", function () {
            element.data('kendoNumericTextBox', {
                element: element,
                value: $.noop,
                trigger: $.noop,
                _placeholder: $.noop,
                _focusin: $.noop,
                _blur: $.noop
            });
            $.fn.kendoNumericTextBox = function () {
                return element;
            };

            spyOn(WC.HtmlHelper, 'DestroyNumericIfExists');
            var result = exportHandler.CreateAddModelDateUI();

            expect(result).not.toBe(null);
            expect(typeof result._placeholder).toBe('function');
            expect(typeof result.__placeholder).toBe('function');
            expect(typeof result._focusin).toBe('function');
            expect(typeof result.__focusin).toBe('function');
            expect(typeof result._blur).toBe('function');
            expect(typeof result.__blur).toBe('function');
            expect(WC.HtmlHelper.DestroyNumericIfExists).toHaveBeenCalled();
        });
    });

    describe("call GetModelDateInputValue", function () {
        var tests = [
            { value: null, expected: "None" },
            { value: 0, expected: 0 },
            { value: 1, expected: 1 },
            { value: 2, expected: 2 }
        ];

        $.each(tests, function (index, test) {
            it("should get correct model date input value (" + test.value + " -> " + test.expected + ")", function () {
                var result = exportHandler.GetModelDateInputValue(test.value);
                expect(test.expected).toEqual(result);
            });
        });
    });

    describe("call SetModelDateColumn", function () {
        var tests = [
            { value: 0, expected: 0 },
            { value: 1, expected: 1 },
            { value: 2, expected: 2 },
            { value: 5, expected: 5 },
            { value: 6, expected: 5 },
            { value: 10, expected: 5 }
        ];

        $.each(tests, function (index, test) {
            it("should set correct model date column with 5 columns (" + test.value + " -> " + test.expected + ")", function () {
                exportHandler.SetModelDateColumn(test.value, 5);
                expect(test.expected).toEqual(exportHandler.CurrentExportModel.AddModelDateAtColumn);
            });
        });
    });
    describe(".SetButtonStatus", function () {
        it("Should call a function", function () {
            spyOn(jQuery.fn, 'removeClass').and.returnValue($());
            exportHandler.SetButtonStatus();
            expect(jQuery.fn.removeClass).toHaveBeenCalled();
        });
    });
});
