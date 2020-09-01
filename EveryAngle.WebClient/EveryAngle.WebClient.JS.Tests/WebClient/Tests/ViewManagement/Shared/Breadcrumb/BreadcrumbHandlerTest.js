/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/modelclasseshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/viewmanagement/shared/SearchStorageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/Breadcrumb/BreadcrumbHandler.js" />


describe("BreadcrumbHandler", function () {
    var breadcrumbHandlerTest;
    beforeEach(function () {
        breadcrumbHandlerTest = new BreadcrumbHandler();
    });

    describe(".Build", function () {
        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
        });
        it("should have 1 item", function () {
            breadcrumbHandlerTest.Initial($('<div/>'), []);

            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(breadcrumbHandlerTest.$Container.length).toEqual(1);
            expect(breadcrumbHandlerTest.Data().length).toEqual(1);
        });
        it("should have 2 items", function () {
            breadcrumbHandlerTest.Initial($('<div/>'), [new BreadcrumbViewModel()]);

            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(breadcrumbHandlerTest.$Container.length).toEqual(1);
            expect(breadcrumbHandlerTest.Data().length).toEqual(2);
        });
    });

    describe(".GetSearchKeyword", function () {
        var searchResult;

        it("should get search keyword", function () {
            spyOn(searchStorageHandler, 'GetSearchUrl').and.returnValue(searchPageUrl + '#/?q=test%20test');
            searchResult = breadcrumbHandlerTest.GetSearchKeyword();
            expect(searchResult).toEqual('test test');
        });

        it("should get empty search keyword", function () {
            spyOn(searchStorageHandler, 'GetSearchUrl').and.returnValue(searchPageUrl + '#/?sort=id');
            searchResult = breadcrumbHandlerTest.GetSearchKeyword();
            expect(searchResult).toEqual('');
        });

    });

    describe(".GetSearchResultsLabel", function () {
        var searchResult;

        it("should create search label correctly", function () {
            searchResult = breadcrumbHandlerTest.GetSearchResultsLabel('test test');
            expect(searchResult).toEqual('Search results: "test test"');
        });

        it("should create search label with empty keyword when it has no keyword correctly", function () {
            searchResult = breadcrumbHandlerTest.GetSearchResultsLabel('');
            expect(searchResult).toEqual('Search results');
        });

    });

    describe(".GetSearchResultsViewModel", function () {
        it("should get search results view model correctly", function () {
            spyOn(searchStorageHandler, 'GetSearchUrl').and.returnValue(searchPageUrl + '#/?q=test');
            var viewModel = breadcrumbHandlerTest.GetSearchResultsViewModel();
            expect(viewModel.label()).toEqual('Search results: "test"');
            expect(viewModel.url()).toEqual(searchPageUrl + '#/?q=test');
        });

        it("should get search results with long text view model correctly", function () {
            spyOn(searchStorageHandler, 'GetSearchUrl').and.returnValue(searchPageUrl + '#/?q=test%20test%20test%20test%20test%20test%20test%20test');
            var viewModel = breadcrumbHandlerTest.GetSearchResultsViewModel();
            expect(viewModel.label()).toEqual('Search results: "test test test test..."');
            expect(viewModel.url()).toEqual(searchPageUrl + '#/?q=test%20test%20test%20test%20test%20test%20test%20test');
        });
    });

    describe(".GetItemViewModel", function () {
        it("should get item view model", function () {
            var viewModel = breadcrumbHandlerTest.GetItemViewModel('test', false);
            expect(viewModel.label()).toEqual('test');
            expect(viewModel.title()).toEqual('test');
            expect(viewModel.separatorIcon()).toEqual('icon icon-chevron-right icon-breadcrumb-separator');
            expect(viewModel.rearIcon()).toEqual('always-hide');
        });
        it("should get item view model with validated state", function () {
            var viewModel = breadcrumbHandlerTest.GetItemViewModel('test', true);
            expect(viewModel.label()).toEqual('test');
            expect(viewModel.title()).toEqual('test');
            expect(viewModel.separatorIcon()).toEqual('icon icon-chevron-right icon-breadcrumb-separator');
            expect(viewModel.rearIcon()).toEqual('icon icon-validated icon-breadcrumb-rear');
        });
    });
});
