/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/viewmanagement/shared/modelclasseshandler.js" />
/// <reference path="/Dependencies/viewmanagement/shared/SearchStorageHandler.js" />

/// <reference path="/Dependencies/ViewManagement/Shared/Breadcrumb/BreadcrumbHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/Breadcrumb/AngleBreadcrumbHandler.js" />


describe("AngleBreadcrumbHandler", function () {
    var angleBreadcrumbHandlerTest;

    beforeEach(function () {
        angleBreadcrumbHandlerTest = new AngleBreadcrumbHandler();
    });

    describe(".GetAngleViewModel", function () {

        it("should get angle breadcrumb view model correctly", function () {
            spyOn(angleBreadcrumbHandlerTest, 'GetAngleUrl').and.returnValue('/test/url');
            var viewModel = angleBreadcrumbHandlerTest.GetAngleViewModel('angle name', true);
            expect(viewModel.label()).toEqual('angle name');
            expect(viewModel.url()).toEqual('/test/url');
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
            spyOn(modelClassesHandler, 'GetClassById').and.returnValue({ short_name: 'Customer' });
            
            var resultLabel = angleBreadcrumbHandlerTest.GetDrilldownResultLabel('CustomerType', '/models/1');
            expect(resultLabel).toEqual('Drilldown to item "Customer"');
        });

        it("should get drilldown result label as Id", function () {
            spyOn(modelClassesHandler, 'GetClassById').and.returnValue(null);
            
            var resultLabel = angleBreadcrumbHandlerTest.GetDrilldownResultLabel('CustomerType', '/models/1');
            expect(resultLabel).toEqual('Drilldown to item "CustomerType"');
        });
        
    });
    
});
