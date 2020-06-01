/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetDetails/WidgetDetailsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetDetails/WidgetDetailsView.js" />

describe("WidgetDetailsHandler", function () {

    var widgetDetailsHandler;

    beforeEach(function () {
        widgetDetailsHandler = new WidgetDetailsHandler();
    });

    describe(".GetModelInfo", function () {

        it("should not get info if no model data", function () {
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue(null);

            var result = widgetDetailsHandler.GetModelInfo();

            expect('').toEqual(result);
        });

        it("should not get info if no about model data", function () {
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue(null);

            var result = widgetDetailsHandler.GetModelInfo();

            expect('').toEqual(result);
        });

        it("should get info if has data", function () {
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
            spyOn(aboutSystemHandler, 'GetModelInfoById').and.returnValue({
                name: function () { return 'name'; },
                date: function () { return 'date'; }
            });

            var result = widgetDetailsHandler.GetModelInfo();

            expect('name date').toEqual(result);
        });

    });
});
