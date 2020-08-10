/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Exports/ExportExcelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/HtmlTemplate/Export/exportexcelhtmltemplate.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DefaultExcelDatastoreHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemFilesHandler.js" />
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
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/modelclasseshandler.js" />

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
                    },
                    {
                        id: 'template_file',
                        value: 'EveryAngle-Test.xlsx',
                        options: [
                            {
                                id: "EveryAngle-Test.xlsx",
                                name: "EveryAngle-Test.xlsx"
                            },
                            {
                                id: "EveryAngle-Test1.xlsx",
                                name: "EveryAngle-Test1.xlsx"
                            }
                        ]
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
    describe(".GetItemTemplate", function () {

        it("should show innowera icon when innowera file", function () {
            var data = {
                icon_class: "icon-innowera",
                name: "EveryAngle-Innowera.xlsx"
            }
            var template = kendo.template(exportExcelHandler.GetExcelItemTemplate());
            var result = template(data);

            expect($(result).find('i').hasClass('icon-innowera')).toEqual(true);
        });

        it("should not show innowera icon when standard file", function () {
            var data = {
                icon_class: "none",
                name: "EveryAngle-Standard.xlsx"
            }
            var template = kendo.template(exportExcelHandler.GetExcelItemTemplate());
            var result = template(data);

            expect($(result).find('i').hasClass('icon-innowera')).toEqual(false);
        });
    });
    describe("call SetExportModelUI", function () {
        var element, ddlElement;

        beforeEach(function () {
            element = $('<div id="InsertModelTimestamp" />').appendTo('body');
            ddlElement = $('<div id="ExcelTemplate" />').data('kendoDropDownList', {
                value: $.noop,
                dataItem: $.noop
            }).appendTo('body');
        });

        afterEach(function () {
            element.remove();
            ddlElement.remove();
        });

        it("should call function ", function () {
            exportExcelHandler.CurrentExportModel.HeaderFormats = {};
            exportExcelHandler.CurrentExportModel = {
                HeaderFormat: function () { },
                TemplateFile: function () { },
                ModelTimestampIndex: function () {}
            };
            $.fn.kendoDropDownList = $.noop;
            element.data('kendoNumericTextBox', {
                element: element
            });
            $.fn.kendoNumericTextBox = function () {
                return element;
            };
            spyOn($.fn, 'kendoDropDownList').and.returnValue(ddlElement);
            spyOn($.fn, 'kendoNumericTextBox').and.returnValue($());
            spyOn(WC.HtmlHelper, 'DestroyNumericIfExists');
            spyOn(exportExcelHandler, 'GetExcelItemTemplate').and.returnValue($.noop);
            spyOn(excelTemplateFilesHandler, 'GetDropdownData').and.returnValue($.noop);
            spyOn(exportExcelHandler, 'ShowInnoweraDetails').and.returnValue($.noop);

            exportExcelHandler.SetExportModelUI();

            expect($.fn.kendoDropDownList).toHaveBeenCalled();
            expect(WC.HtmlHelper.DestroyNumericIfExists).toHaveBeenCalled();
            expect($.fn.kendoNumericTextBox).toHaveBeenCalled();
            expect(excelTemplateFilesHandler.GetDropdownData).toHaveBeenCalled();
            expect(exportExcelHandler.ShowInnoweraDetails).toHaveBeenCalled();
        });
    });
    describe(".ShowInnoweraDetails", function () {

        var expected = [
            '<span data-role=\"tooltip\" data-tooltip-text=\"MM02/MM02_Plant\">',
                'MM02/MM02_Plant',
            '</span><br>',
            '<span data-role=\"tooltip\" data-tooltip-text=\"GX0K/GX0K_Material\">',
                'GX0K/GX0K_Material',
            '</span><br>'
        ].join('');

        beforeEach(function () {
            element = $('<div id=\"InnoweraDetails\"/>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should show innowera details when exist", function () {
            var fileData = {
                is_innowera: true,
                innowera_details: [
                    {
                        sap_process_name: "MM02",
                        display_name: "MM02_Plant"
                    },
                    {
                        sap_process_name: "GX0K",
                        display_name: "GX0K_Material"
                    }
                ]
            };
            spyOn($.fn, 'find').and.returnValue(element);

            exportExcelHandler.ShowInnoweraDetails(fileData);

            expect(element.html()).toEqual(expected);
        });

        it("should not show innowera details when not exist", function () {
            var fileData = {
                is_innowera: false
            };
            spyOn($.fn, 'find').and.returnValue(element);

            exportExcelHandler.ShowInnoweraDetails(fileData);

            expect(element.html()).toEqual('');
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
            spyOn(exportExcelHandler, "GetExcelTemplate").and.returnValue();
            var result = exportExcelHandler.SetExportModel(datastore);
            expect(result.AddAngleDefinition()).toBe(false);
            expect(exportExcelHandler.GetExcelTemplate).toHaveBeenCalled();
        });
        it("should set file name  to Export Model", function () {
            spyOn(exportExcelHandler, "GetExcelTemplate").and.returnValue();
            var result = exportExcelHandler.SetExportModel(datastore);
            expect(result.FileName()).toBe('Test');
            expect(exportExcelHandler.GetExcelTemplate).toHaveBeenCalled();
        });        
    });
    describe("call SetDefaultExcelSetting", function () {
        beforeEach(function () {
            exportExcelHandler.CurrentExportModel = new ExportExcelModel();
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
            expect(window.CleanExcelFileName).not.toHaveBeenCalled();
        });

    });
    describe(".SetButtonStatus", function () {
        it("Should call a function", function () {
            spyOn(jQuery.fn, 'removeClass').and.returnValue($());
            exportExcelHandler.SetButtonStatus();
            expect(jQuery.fn.removeClass).toHaveBeenCalled();
        });
    });
    describe(".GetExcelTemplate", function () {
        it("It should return the displayData excel template", function () {
            var displayData = {
                display_details: "{\"excel_template\" : \"EveryAngle-Standard.xlsx\"}"
            };
            spyOn(displayModel, 'Data').and.returnValue(displayData);
            spyOn(exportExcelHandler, 'IsTemplateExist').and.returnValue(true);
            var result = exportExcelHandler.GetExcelTemplate();
            expect(result).toBe("EveryAngle-Standard.xlsx");
        });
        it("It should return the datastore default excel template", function () {
            var displayData = {
                display_details: ""
            };
            spyOn(displayModel, 'Data').and.returnValue(displayData);
            spyOn(exportExcelHandler, 'IsTemplateExist').and.returnValue(false);
            spyOn(defaultExcelDatastoreHandler, 'GetDefaultTemplate').and.returnValue('EveryAngle-Test.xlsx')
            var result = exportExcelHandler.GetExcelTemplate();
            expect(result).toBe("EveryAngle-Test.xlsx");
        });
    });
    describe(".SetVisibleInsertModelStamp", function () {
        beforeEach(function () {
            spyOn($.fn, 'show');
            spyOn($.fn, 'hide');
        });
        it("Should call a function show", function () {
            var displaytype = enumHandlers.DISPLAYTYPE.LIST;
            exportExcelHandler.SetVisibleInsertModelStamp(displaytype);
            expect($.fn.show).toHaveBeenCalled();
            expect($.fn.hide).not.toHaveBeenCalled();
        });
        it("Should call a function hide", function () {
            var displaytype = enumHandlers.DISPLAYTYPE.LISTDRILLDOWN;
            exportExcelHandler.SetVisibleInsertModelStamp(displaytype);
            expect($.fn.show).not.toHaveBeenCalled();
            expect($.fn.hide).toHaveBeenCalled();
        });
    });
    describe(".SetSheetName", function () {
        beforeEach(function () {
            element = $('<input id="SaveFileName" /><input id="SaveSheetName"/>').appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });
        it("File Name in text box should be equal to angle name", function () {
            angleInfoModel.Name = function () {
                return 'angle for test';
            };           
            exportExcelHandler.SetSheetName();
            var FileName = $("#SaveFileName").val();
            expect(FileName).toBe(angleInfoModel.Name());
        });
        it("Sheet name in text box should be equal to display name", function () {
            displayModel.Name = function () {
                return 'New_display';
            };
            exportExcelHandler.SetSheetName();
            var SheetName = $("#SaveSheetName").val();
            expect(SheetName).toBe(displayModel.Name());
        });
        it("File name and sheet name text box value should be equal to expected", function () {
            angleInfoModel.Data = function () {
                return { model: "/models/1"};
            };           
            var drilldownUri = "{%22ID%22:%223000000005/2/1%22,%22ObjectType%22:%22PurchaseOrderScheduleLine%22}";
            var Details = {
                short_name: 'PD Schedule Line'
            };
            var expectedFileName = "PD Schedule Line #300000000521";
            var expectedSheetName = "Drilldown to item PD Schedule ";
            spyOn(WC.Utility, 'UrlParameter').and.returnValue(drilldownUri);
            spyOn(modelClassesHandler,'GetClassById').and.returnValue(Details);
            exportExcelHandler.SetSheetName();
            var SheetName = $("#SaveSheetName").val();
            var FileName = $("#SaveFileName").val();
            expect(SheetName).toBe(expectedSheetName);
            expect(FileName).toBe(expectedFileName);
        });
    });
});
