/// <reference path="/Dependencies/ViewManagement/Shared/SearchStorageHandler.js" />

describe("SearchStorageHandler", function () {
    var searchStorageHandler;
    beforeEach(function () {
        searchStorageHandler = new SearchStorageHandler();
    });

    describe(".Initial", function () {
        beforeEach(function () {
            spyOn(WC.Utility, 'RemoveUrlParameter').and.callFake($.noop);
            spyOn(searchStorageHandler, 'UpdateId').and.callFake($.noop);
            spyOn(searchStorageHandler, 'OnUrlChange').and.callFake($.noop);
        });

        it("should set Id", function () {
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('id1');
            spyOn(searchStorageHandler, 'Get').and.returnValue('url');
            searchStorageHandler.Initial(true, true, true);

            // assert
            expect(searchStorageHandler.Id).toEqual('id1');
            expect(WC.Utility.RemoveUrlParameter).not.toHaveBeenCalled();
            expect(searchStorageHandler.UpdateId).not.toHaveBeenCalled();
        });

        it("should update Id", function () {
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('');
            spyOn(searchStorageHandler, 'Get').and.returnValue('');
            searchStorageHandler.Initial(true, true, true);

            // assert
            expect(WC.Utility.RemoveUrlParameter).toHaveBeenCalled();
            expect(searchStorageHandler.UpdateId).toHaveBeenCalled();
        });
    });

    describe(".Get", function () {
        beforeEach(function () {
            spyOn(searchStorageHandler, 'GetAll').and.returnValue({ 'id1': 'url' });
        });

        it("should get data", function () {
            var result = searchStorageHandler.Get('id1');

            // assert
            expect(result).toEqual('url');
        });

        it("should not get data", function () {
            var result = searchStorageHandler.Get('id2');

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".GetUrl", function () {
        it("should get url", function () {
            spyOn(jQuery.address, 'value').and.returnValue('/fq=test');
            var result = searchStorageHandler.GetUrl();

            // assert
            expect(result).toEqual('/fq=test');
        });

        it("should not get url if '/'", function () {
            spyOn(jQuery.address, 'value').and.returnValue('/');
            var result = searchStorageHandler.GetUrl();

            // assert
            expect(result).toEqual('');
        });

        it("should not get url if empty", function () {
            spyOn(jQuery.address, 'value').and.returnValue('');
            var result = searchStorageHandler.GetUrl();

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".GetSearchUrl", function () {
        it("should get search url with hash", function () {
            spyOn(searchStorageHandler, 'Get').and.returnValue('/fq=test');
            var result = searchStorageHandler.GetSearchUrl();

            // assert
            expect(result).toEqual('/en/search/searchpage#/fq=test');
        });

        it("should get search url without hash", function () {
            spyOn(searchStorageHandler, 'Get').and.returnValue('');
            var result = searchStorageHandler.GetSearchUrl();

            // assert
            expect(result).toEqual('/en/search/searchpage');
        });
    });

    describe(".UpdateId", function () {
        beforeEach(function () {
            spyOn(searchStorageHandler, 'GetAll').and.returnValue({ 'id1': 'url' });
        });

        it("should use the existing Id", function () {
            spyOn(searchStorageHandler, 'GetUrl').and.returnValue('url');
            searchStorageHandler.UpdateId();

            // assert
            expect(searchStorageHandler.Id).toEqual('id1');
        });

        it("should create a new Id", function () {
            spyOn(searchStorageHandler, 'GetUrl').and.returnValue('url2');
            spyOn(jQuery, 'GUID').and.returnValue('1234567890');
            searchStorageHandler.UpdateId();

            // assert
            expect(searchStorageHandler.Id).toEqual('12345678');
        });
    });

    describe(".UpdateAngleQuery", function () {
        var query;
        beforeEach(function () {
            query = {};
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('');
            spyOn(WC.Utility, 'RemoveUrlParameter').and.callFake($.noop);
            spyOn(searchStorageHandler, 'Get').and.returnValue('url');
            spyOn(searchStorageHandler, 'UpdateId').and.callFake($.noop);
            spyOn(searchStorageHandler, 'OnUrlChange').and.callFake($.noop);
        });

        it("should update Angle query", function () {
            searchStorageHandler.Initial(true, true, true);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.UpdateAngleQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).toEqual('id1');
        });

        it("should not update Angle query if Id is empty", function () {
            searchStorageHandler.Initial(true, true, true);
            searchStorageHandler.Id = '';
            searchStorageHandler.UpdateAngleQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).not.toBeDefined();
        });

        it("should not update Angle query if AppendAngleUrl = false", function () {
            searchStorageHandler.Initial(true, false, true);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.UpdateAngleQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).not.toBeDefined();
        });
    });

    describe(".UpdateDashboardQuery", function () {
        var query;
        beforeEach(function () {
            query = {};
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('');
            spyOn(WC.Utility, 'RemoveUrlParameter').and.callFake($.noop);
            spyOn(searchStorageHandler, 'Get').and.returnValue('url');
            spyOn(searchStorageHandler, 'UpdateId').and.callFake($.noop);
            spyOn(searchStorageHandler, 'OnUrlChange').and.callFake($.noop);
        });

        it("should update Dashboard query", function () {
            searchStorageHandler.Initial(true, true, true);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.UpdateDashboardQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).toEqual('id1');
        });

        it("should not update Dashboard query if Id is empty", function () {
            searchStorageHandler.Initial(true, true, true);
            searchStorageHandler.Id = '';
            searchStorageHandler.UpdateDashboardQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).not.toBeDefined();
        });

        it("should not update Dashboard query if AppendDashboardUrl = false", function () {
            searchStorageHandler.Initial(true, true, false);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.UpdateDashboardQuery(query);

            // assert
            expect(query[SearchStorageHandler.Query]).not.toBeDefined();
        });
    });

    describe(".Save", function () {
        it("should save data", function () {
            spyOn(searchStorageHandler, 'GetUrl').and.returnValue('url');
            spyOn(searchStorageHandler, 'GetAll').and.returnValue({});
            spyOn(jQuery, 'localStorage').and.callFake($.noop);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.Save();

            // assert
            expect(jQuery.localStorage).toHaveBeenCalled();
        });

        it("should not save data", function () {
            spyOn(searchStorageHandler, 'GetUrl').and.returnValue('');
            spyOn(searchStorageHandler, 'GetAll').and.returnValue({});
            spyOn(jQuery, 'localStorage').and.callFake($.noop);
            searchStorageHandler.Id = 'id1';
            searchStorageHandler.Save();

            // assert
            expect(jQuery.localStorage).not.toHaveBeenCalled();
        });
    });

    describe(".OnUrlChange", function () {
        beforeEach(function () {
            spyOn(WC.Utility, 'UrlParameter').and.returnValue('');
            spyOn(WC.Utility, 'RemoveUrlParameter').and.callFake($.noop);
            spyOn(searchStorageHandler, 'Get').and.returnValue('url');
            spyOn(searchStorageHandler, 'UpdateId').and.callFake($.noop);
            spyOn(searchStorageHandler, 'Save').and.callFake($.noop);
        });

        it("should update Id", function () {
            searchStorageHandler.Initial(true, true, true);
            searchStorageHandler.OnUrlChange();

            // assert
            expect(searchStorageHandler.UpdateId).toHaveBeenCalled();
            expect(searchStorageHandler.Save).toHaveBeenCalled();
        });

        it("should not update Id", function () {
            searchStorageHandler.Initial(false, true, true);
            searchStorageHandler.OnUrlChange();

            // assert
            expect(searchStorageHandler.UpdateId).not.toHaveBeenCalled();
            expect(searchStorageHandler.Save).not.toHaveBeenCalled();
        });
    });
});
