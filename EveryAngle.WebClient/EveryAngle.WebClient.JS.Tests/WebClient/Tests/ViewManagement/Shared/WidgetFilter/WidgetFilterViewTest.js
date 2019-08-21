/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.DateTranslator.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />

describe("WidgetFilterView", function () {

    var widgetFilterView;

    beforeEach(function () {
        var handler = new WidgetFilterHandler(null, []);
        widgetFilterView = new WidgetFilterView(handler);
    });

    describe("call ToggleTreeViewHeader", function () {

        var testCases = [{
            title: 'should collapse current accordion if it is expanded',
            hasClassExpand: true,
            expectedResult: true
        }, {
            title: 'should collapse all accordions when user click to expand the other accordion',
            hasClassExpand: false,
            expectedResult: false
        }];

        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                // mock
                spyOn(jQuery.fn, 'hasClass').and.returnValue(testCase.hasClassExpand);
                spyOn(widgetFilterView, 'GetTreeViewHeader').and.returnValue(jQuery.fn);
                spyOn(widgetFilterView, 'CollapsePanel').and.callThrough();
                spyOn(widgetFilterView, 'CollapseAllAndExpandSelectedPanel').and.callThrough();

                // execute
                widgetFilterView.ToggleTreeViewHeader(null, null);

                // assert
                if (testCase.expectedResult)
                    expect(widgetFilterView.CollapsePanel).toHaveBeenCalled();
                else
                    expect(widgetFilterView.CollapseAllAndExpandSelectedPanel).toHaveBeenCalled();
            });
        });

    });

    describe(".GetFilterPreviewText", function () {

        var data = {};
        var filedType = "date";
        var requestDate = new Date(2019, 0, 1, 22, 59, 59);
        var dateTimeFormat = "MMM/dd/yyyy HH:mm:ss";

        it("should return filter preview text with utc date when preview result is not empty", function () {
            spyOn(widgetFilterView.Handler, 'GetDateTimeFormat').and.returnValue(dateTimeFormat);
            spyOn(WC.WidgetFilterHelper, 'GetDefaultModelDataDate').and.returnValue(requestDate);
            spyOn(WC.WidgetFilterHelper, 'GetTranslatedSettings').and.returnValue({ arguments: ["Dec/31/2018"], template: "Is on {0}" });
            
            var previewText = widgetFilterView.GetFilterPreviewText(data, filedType);
            
            var expectedDateTime = kendo.toString(WC.DateHelper.LocalDateToUtcDate(requestDate), dateTimeFormat);
            var expectedResult = 'Filter is applied relative to UTC model timestamp ' + expectedDateTime + '<br/>Result : <span class="ExampleData">Is on Dec/31/2018<span>';
            expect(expectedResult).toEqual(previewText);
        });

        it("should return empty when preview result is empty", function () {
            spyOn(widgetFilterView.Handler, 'GetDateTimeFormat').and.returnValue(dateTimeFormat);
            spyOn(WC.WidgetFilterHelper, 'GetDefaultModelDataDate').and.returnValue(requestDate);
            spyOn(WC.WidgetFilterHelper, 'GetTranslatedSettings').and.returnValue({ arguments: [""], template: "" });

            var previewText = widgetFilterView.GetFilterPreviewText(data, filedType);

            expect(null).toEqual(previewText);
        });
    });
});
