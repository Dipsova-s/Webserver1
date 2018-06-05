describe("WC.Ajax test", function () {

    describe("AbortAll", function () {

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

    describe("BuildRequestUrl", function () {

        it("Should get proxy url when specific is proxy", function () {

            var url = WC.Ajax.BuildRequestUrl('test');

            expect(url).toBe(rootWebsitePath + 'api/proxy/test');
        });

        it("Should get local url when specific is local", function () {

            var url = WC.Ajax.BuildRequestUrl('test', true);

            expect(url).toBe(rootWebsitePath + '/test');
        });
    });



    describe("Cancel Long Running", function () {

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

    describe("call DeleteResult", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "GetInternalUri").and.callFake(function () { return ''; });
            spyOn(window, "DeleteDataToWebService").and.callFake($.noop);
        });

        it("when not have result url, DeleteDataToWebService should not been called", function () {

            WC.Ajax.DeleteResult();
            expect(window.DeleteDataToWebService).not.toHaveBeenCalled();
        });

        it("when have result url, DeleteDataToWebService have been called", function () {

            WC.Ajax.ResultURL = ['/results/1', 'api/proxy/results/2'];
            WC.Ajax.DeleteResult();
            expect(window.DeleteDataToWebService).toHaveBeenCalled();
        });
    });

    describe("call Request", function () {

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
