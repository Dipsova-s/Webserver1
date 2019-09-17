/// <reference path="/Dependencies/ViewManagement/Exports/ExportExcelHandler.js" />
/// <reference path="/Dependencies/HtmlTemplate/Export/exportexcelhtmltemplate.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldDomainHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/viewmanagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/viewmanagement/Angles/ChartHandler.js" />


describe("ExportExcelHandlerTest", function () {
    var exportExcelHandler;

    beforeEach(function () {
        exportExcelHandler = new ExportExcelHandler();
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



});
