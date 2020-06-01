/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/modelclasseshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/SearchStorageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/Breadcrumb/BreadcrumbHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/Breadcrumb/AngleBreadcrumbHandler.js" />


describe("AngleBreadcrumbHandler", function () {
    var angleBreadcrumbHandlerTest;

    beforeEach(function () {
        angleBreadcrumbHandlerTest = new AngleBreadcrumbHandler();
    });

    describe(".GetAngleViewModel", function () {

        it("should get angle breadcrumb view model correctly when angle is not template", function () {
            spyOn(angleBreadcrumbHandlerTest, 'GetAngleUrl').and.returnValue('/test/url');
            var viewModel = angleBreadcrumbHandlerTest.GetAngleViewModel('angle name', true, false);
            expect(viewModel.label()).toEqual('angle name');
            expect(viewModel.url()).toEqual('/test/url');
            expect(viewModel.itemIcon()).toEqual('icon-angle');
        });

        it("should get angle breadcrumb view model correctly when angle is template", function () {
            spyOn(angleBreadcrumbHandlerTest, 'GetAngleUrl').and.returnValue('/test/url');
            var viewModel = angleBreadcrumbHandlerTest.GetAngleViewModel('angle name', true, true);
            expect(viewModel.label()).toEqual('angle name');
            expect(viewModel.url()).toEqual('/test/url');
            expect(viewModel.itemIcon()).toEqual('icon-template');
        });

    });

    describe(".GetAngleUrl", function () {

        it("should not get Angle url", function () {
            spyOn(WC.Utility, 'UrlParameter').and.returnValue(null);
            var result = angleBreadcrumbHandlerTest.GetAngleUrl();
            expect(result).toEqual('');
        });

        it("should get Angle url", function () {
            spyOn(WC.Utility, 'UrlParameter').and.callFake(function (name) {
                var mappers = {};
                mappers[enumHandlers.ANGLEPARAMETER.ANGLE] = '/angles/1';
                mappers[enumHandlers.ANGLEPARAMETER.DISPLAY] = '/angles/1/displays/1';
                mappers[enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN] = '{"ID":"11656/10","ObjectType":"SalesOrderLine"}';
                mappers[enumHandlers.ANGLEPARAMETER.EDITMODE] = true;
                return mappers[name];
            });
            spyOn(jQuery.address, 'parameterNames').and.returnValue([
                enumHandlers.ANGLEPARAMETER.ANGLE,
                enumHandlers.ANGLEPARAMETER.DISPLAY,
                enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN,
                enumHandlers.ANGLEPARAMETER.EDITMODE
            ]);
            var result = angleBreadcrumbHandlerTest.GetAngleUrl();
            expect(result).toEqual(anglePageUrl + '#/?angle=/angles/1&display=/angles/1/displays/1&editmode=true');
        });

    });

    describe(".GetDrilldownViewModel", function () {

        it("should get drilldown result view model", function () {
            spyOn(angleBreadcrumbHandlerTest, 'GetDrilldownResultLabel').and.returnValue('Drilldown to item "Customer"');
            
            var result = angleBreadcrumbHandlerTest.GetDrilldownViewModel({}, '/models/1');
            expect(result.frontIcon()).toEqual('icon icon-chevron-right icon-breadcrumb-chevron');
            expect(result.label()).toEqual('Drilldown to item "Customer"');
        });
        
    });

    describe(".GetDrilldownResultLabel", function () {

        it("should get drilldown result label from class model", function () {
            spyOn(modelClassesHandler, 'GetClassName').and.returnValue('Customer');
            
            var resultLabel = angleBreadcrumbHandlerTest.GetDrilldownResultLabel('CustomerType', '/models/1');
            expect(resultLabel).toEqual('Drilldown to item "Customer"');
        });
        
    });
    
});
