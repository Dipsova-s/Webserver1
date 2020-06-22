/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Exports/ExportExcelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/HtmlTemplate/Export/exportexcelhtmltemplate.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/Chart/ChartOptionsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FieldSettingsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ChartHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelCurrentInstanceHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Exports/ExportExcelModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />

describe("ExportExcelHandlerTest", function () {
    var exportExcelHandler;
    var datastore;
    beforeEach(function () {
        exportExcelHandler = new ExportExcelHandler();
        datastore = {
            data_settings: {
                setting_list: [
                    {
                        id: 'add_angle_definition',
                        value: false
                    },
                    {
                        id: 'file_name',
                        value: 'new_display'
                    }]
            }
        };
    });

    describe("Check the visibility of the number to export", function () {
        var element;

        beforeEach(function () {
            $('<div id="NumberOfItem" />').appendTo('body');
            element = $('#NumberOfItem');
        });

        afterEach(function () {
            $('#NumberOfItem').remove();
        });

        it("Display LIST Should see the number to export", function () {
            exportExcelHandler.SetVisibilityForNumberOfItems(enumHandlers.DISPLAYTYPE.LIST);
            expect(element.is(":visible")).toBe(true);
        });

        it("Display CHART Should not see the number to export", function () {
            exportExcelHandler.SetVisibilityForNumberOfItems(enumHandlers.DISPLAYTYPE.CHART);
            expect(element.is(":visible")).toBe(false);
        });

        it("Display PIVOT Should not see the number to export", function () {
            exportExcelHandler.SetVisibilityForNumberOfItems(enumHandlers.DISPLAYTYPE.PIVOT);
            expect(element.is(":visible")).toBe(false);
        });

    });

    describe("call ShowNotSupportExportChartToExcelWarning", function () {
        var element;

        beforeEach(function () {
            $('<div class="row warningMessage" />').appendTo('body');
            element = $('.warningMessage');
        });

        afterEach(function () {
            $('.warningMessage').remove();
        });

        it("LIST should not see the warning message", function () {
            exportExcelHandler.ShowNotSupportExportChartToExcelWarning(enumHandlers.DISPLAYTYPE.LIST, {});
            expect(element.is(":visible")).toBe(false);
        });

        it("PIVOT should not see the warning message", function () {
            exportExcelHandler.ShowNotSupportExportChartToExcelWarning(enumHandlers.DISPLAYTYPE.PIVOT, {});
            expect(element.is(":visible")).toBe(false);
        });

        it("CHART should not see warning if it support", function () {
            spyOn(exportExcelHandler, "IsSupportExcelExportAsChart").and.callFake(function () { return true; });
            exportExcelHandler.ShowNotSupportExportChartToExcelWarning(enumHandlers.DISPLAYTYPE.CHART, {});
            expect(element.is(":visible")).toBe(false);
        });

        it("CHART should see warning if it does not support", function () {
            spyOn(exportExcelHandler, "IsSupportExcelExportAsChart").and.callFake(function () { return false; });
            exportExcelHandler.ShowNotSupportExportChartToExcelWarning(enumHandlers.DISPLAYTYPE.CHART, {});
            expect(element.is(":visible")).toBe(true);
        });
    });

    describe("call IsSupportExcelExportAsChart", function () {

        var allsupportCharts = ['area', 'column', 'line', 'bar', 'radarLine', 'donut', 'pie', 'scatter', 'bubble'];
        var supportStackCharts = ['area', 'column', 'line', 'bar', 'radarLine'];
        var unsupportCharts = ['gauge'];

        it("should get 'true' if chart_type support", function () {
            $.each(allsupportCharts, function (index, type) {
                var result = exportExcelHandler.IsSupportExcelExportAsChart(type, false);
                expect(result).toBe(true);
            });
        });

        it("should get 'true' if chart_type support and stack", function () {
            $.each(supportStackCharts, function (index, type) {
                var result = exportExcelHandler.IsSupportExcelExportAsChart(type, true);
                expect(result).toBe(true);
            });
        });

        it("should get 'false' if chart_type does not support", function () {
            $.each(unsupportCharts, function (index, type) {
                var result = exportExcelHandler.IsSupportExcelExportAsChart(type, false);
                expect(result).toBe(false);
            });
        });

    });
    describe("call ValidateExportExcel", function () {
        it("should return true", function () {
            spyOn(window, 'IsValidFileAndSheetName').and.returnValue(true);
            spyOn(popup, "Alert").and.callFake($.noop);
            var filename = "Export_to_Excel";
            var result = exportExcelHandler.ValidateExportExcel(filename);
            expect(result).toBe(true);            
        });
        it("should return false", function () {
            spyOn(window, 'IsValidFileAndSheetName').and.returnValue(false);
            spyOn(popup, "Alert").and.callFake($.noop);
            var filename = "Export_to_Excel";
            var result = exportExcelHandler.ValidateExportExcel(filename);
            expect(result).toBe(false);
        });
    });
    describe("call SetExportModelUI", function () {
        it("should call function ", function () {
            exportExcelHandler.CurrentExportModel.HeaderFormats = {};
            exportExcelHandler.CurrentExportModel = {
                HeaderFormat: function () { }
            };
            $.fn.kendoDropDownList = $.noop;
            spyOn($.fn, 'kendoDropDownList').and.returnValue($());
            exportExcelHandler.SetExportModelUI();
            expect($.fn.kendoDropDownList).toHaveBeenCalled();
        });
    });
    describe("call GetDatastoreDataSetting", function () {
        it("should return expected value ", function () {
            var exportOptions = {
                'data_settings': {
                    'setting_list': [
                        {
                            "id": "sheet_name",
                            "value": 'new_display'
                        }]
                }
            };
            var id = "sheet_name";
            var result = exportExcelHandler.GetDatastoreDataSetting(exportOptions, id);
            expect(result).toBe('new_display');
        });
    });
    describe("call GetDefaultExcelDatastore", function () {
        it("should call a function", function () {
            var exportOptions = {
                    'datastores': {
                        'datastore_plugin': 'msexcel',
                        'findObject': function () { return true;}
                    }
            };
            spyOn(exportExcelHandler, 'SetExportModel');
            spyOn(exportExcelHandler, 'SetExportModelUI');
            
            spyOn(directoryHandler, 'GetDirectoryUri').and.callFake(function () { return ''; });
            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when(exportOptions); });
            spyOn($.fn, 'busyIndicator');
            exportExcelHandler.GetDefaultExcelDatastore();
            expect(exportExcelHandler.SetExportModel).toHaveBeenCalled();
            expect(exportExcelHandler.SetExportModelUI).toHaveBeenCalled();
        });
    });
    describe("call SetExportModel", function () {
        beforeEach(function () {
            exportExcelHandler.CurrentExportModel = new ExportExcelModel({
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

        it("should set add angle definition  to Export Model", function () {
            var result = exportExcelHandler.SetExportModel(datastore);
            expect(result.AddAngleDefinition()).toBe(false);
        });
        it("should set file name  to Export Model", function () {
            var result = exportExcelHandler.SetExportModel(datastore);
            expect(result.FileName()).toBe('new_display');
        });        
    });
    describe("call SetDefaultExcelSetting", function () {
        beforeEach(function () {
            exportExcelHandler.CurrentExportModel = new ExportExcelModel({
                FileName: 'Test'
            });
            resultModel.Data({ data_rows: '12' })
        });
        it("should call a function", function () {
            spyOn(angleInfoModel, 'Data').and.returnValue({});
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
            spyOn(window, 'CleanExcelFileName').and.returnValue({});
            spyOn(ko, 'dataFor').and.returnValue({ area: $.noop });
            spyOn(systemSettingHandler, 'GetMaxPageSize').and.callFake(function () { return 99; });
            spyOn(displayModel, 'Data').and.returnValue({ uri: 'test' });
            spyOn(userModel, 'Data').and.returnValue({ settings: '' });
            spyOn(modelCurrentInstanceHandler, 'GetCurrentModelInstance').and.returnValue({ modeldata_timestamp: '' });
            spyOn(exportExcelHandler, 'GetCurrentDisplayField').and.returnValue(null);
            spyOn(exportExcelHandler, 'GetDefaultExcelDatastore').and.returnValue();
            exportExcelHandler.SetDefaultExcelSettings();
            expect(exportExcelHandler.GetDefaultExcelDatastore).toHaveBeenCalled();
        });

    });
});
