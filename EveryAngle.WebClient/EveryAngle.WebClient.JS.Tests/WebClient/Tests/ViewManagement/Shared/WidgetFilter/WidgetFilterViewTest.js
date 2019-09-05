/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHandler.js" />
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
});
