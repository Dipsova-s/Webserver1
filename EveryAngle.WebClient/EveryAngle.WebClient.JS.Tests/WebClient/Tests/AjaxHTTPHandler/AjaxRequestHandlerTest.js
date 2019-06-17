describe("WC.Ajax", function () {

    describe(".ExecuteBeforeExit", function () {

        it("should not process requests if disabled then the state is reset", function () {
            spyOn(WC.Ajax, 'SendExitRequests').and.callFake($.noop);

            WC.Ajax.EnableBeforeExit = false;
            WC.Ajax.ExecuteBeforeExit();

            expect(WC.Ajax.SendExitRequests).not.toHaveBeenCalled();
            expect(WC.Ajax.EnableBeforeExit).toEqual(true);
        });

        it("should not process requests if enabled", function () {
            spyOn(WC.Ajax, 'SendExitRequests').and.callFake($.noop);

            WC.Ajax.EnableBeforeExit = true;
            WC.Ajax.ExecuteBeforeExit();

            expect(WC.Ajax.SendExitRequests).toHaveBeenCalled();
        });

    });

    describe(".GetAbortingRequestsData", function () {

        it("should get aborting requests", function () {
            spyOn(WC.Ajax, 'SendExitRequests').and.callFake($.noop);

            var urls = [
                '/results/1',
                '/results/2',
                '/results/1',
                '/results/3'
            ];
            var requests = WC.Ajax.GetAbortingRequestsData(urls);

            expect(requests.length).toEqual(3);
            expect(requests[0].method).toEqual(RequestModel.METHOD.DELETE);
            expect(requests[0].data).toEqual('');
            expect(requests[0].url).toEqual('/results/1');
            expect(requests[1].url).toEqual('/results/2');
            expect(requests[2].url).toEqual('/results/3');
        });

    });

    describe(".SendExitRequests", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, 'GetInternalUri').and.returnValue('url');
            spyOn(window, 'CreateDataToWebService').and.callFake($.noop);
            spyOn(WC.Ajax, 'SendBeacon').and.callFake($.noop);
        });

        it("should not process requests if no data", function () {
            var data = [];
            WC.Ajax.SendExitRequests(data);

            expect(WC.HtmlHelper.GetInternalUri).not.toHaveBeenCalled();
        });

        it("should use navigator.sendBeacon if supported", function () {
            Modernizr.sendbeacon = true;
            var data = [{}];
            WC.Ajax.SendExitRequests(data, true);

            expect(WC.Ajax.SendBeacon).toHaveBeenCalled();
            expect(window.CreateDataToWebService).not.toHaveBeenCalled();
        });

        it("should use CreateDataToWebService if navigator.sendBeacon does not support", function () {
            Modernizr.sendbeacon = false;
            var data = [{}];
            WC.Ajax.SendExitRequests(data, true);
            expect(WC.Ajax.SendBeacon).not.toHaveBeenCalled();
            expect(window.CreateDataToWebService).toHaveBeenCalled();
        });

        it("should use CreateDataToWebService if prefer to use", function () {
            Modernizr.sendbeacon = true;
            var data = [{}];
            WC.Ajax.SendExitRequests(data, false);
            expect(WC.Ajax.SendBeacon).not.toHaveBeenCalled();
            expect(window.CreateDataToWebService).toHaveBeenCalled();
        });
    });

    describe(".AbortAll", function () {

        beforeEach(function () {
            // setup xhr
            spyOn($, 'ajax').and.callFake(function () {
                return { settings: {}, abort: $.noop };
            });
            WC.Ajax.XHR.push($.ajax());
        });

        it("Should reset this.XHR and jQuery.active", function () {
            WC.Ajax.AbortAll();

            expect(WC.Ajax.XHR.length).toBe(0);
            expect(jQuery.active).toBe(0);
        });
    });

    describe(".BuildRequestUrl", function () {

        it("Should get proxy url when specific is proxy", function () {

            var url = WC.Ajax.BuildRequestUrl('test');

            expect(url).toBe(rootWebsitePath + 'api/proxy/test');
        });

        it("Should get local url when specific is local", function () {

            var url = WC.Ajax.BuildRequestUrl('test', true);

            expect(url).toBe(rootWebsitePath + '/test');
        });
    });

    describe(".GetLongRunUrls", function () {

        beforeEach(function () {
            WC.Ajax.XHR = [];
            WC.Ajax.XHR.push({ settings: { url: '/results/1', type: "GET" } });
            WC.Ajax.XHR.push({ settings: { url: '/results/1/data_fields', type: "GET" } });
            WC.Ajax.XHR.push({ settings: { url: '/results/2', type: "GET" } });
            WC.Ajax.XHR.push({ settings: { url: '/results/2/data_fields', type: "GET" } });
            WC.Ajax.XHR.push({ settings: { url: '/results/2', type: "GET" } });
        });

        afterEach(function () {
            WC.Ajax.XHR = [];
        });

        it("Check is result url", function () {

            var isResultUrl = WC.Ajax.IsResultUrl("/results/1", "POST");
            var isResultUrl2 = WC.Ajax.IsResultUrl("/results/1/data_fields", "POST");
            var isResultUrl3 = WC.Ajax.IsResultUrl("/results/100", "GET");
            var isResultUrl4 = WC.Ajax.IsResultUrl("/results/1/data_fields", "GET");
            var isResultUrl5 = WC.Ajax.IsResultUrl("/datarow/1", "POST");

            expect(isResultUrl).toBe(false);
            expect(isResultUrl2).toBe(false);
            expect(isResultUrl3).toBe(true);
            expect(isResultUrl4).toBe(false);
            expect(isResultUrl5).toBe(false);
        });

        it("Can get Get Long Running Urls", function () {

            var urls = WC.Ajax.GetLongRunUrls();

            expect(urls.length).toBe(3);
            expect(urls[0]).toBe("/results/1");
            expect(urls[1]).toBe("/results/2");
            expect(urls[2]).toBe("/results/2");
        });

    });

    describe(".Request", function () {

        it("when request result url, url should store in WC.Ajax.ResultURL", function () {
            spyOn($, 'ajax').and.callFake($.noop);
            window.ajaxTimeoutExpirationInSeconds = 100;
            WC.Ajax.ResultURL = ['/results/1'];

            WC.Ajax.Request('/results/1', 'GET', '', {});
            WC.Ajax.Request('/results/2', 'GET', '', {});
            WC.Ajax.Request('/search/searchpage', 'GET', '', {});

            expect(WC.Ajax.ResultURL.length).toBe(3);
        });
    });

});
