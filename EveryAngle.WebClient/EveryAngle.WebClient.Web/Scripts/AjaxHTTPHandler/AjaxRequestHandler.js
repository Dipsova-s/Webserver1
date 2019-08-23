// Ajax
(function (window, helper) {
    "use strict";

    function RequestModel(method, url, data) {
        this.method = method;
        this.url = url;
        this.data = jQuery.isPlainObject(data) ? JSON.stringify(data) : '';
    }
    RequestModel.METHOD = {
        GET: 'GET',
        PUT: 'PUT',
        POST: 'POST',
        DELETE: 'DELETE'
    };
    window.RequestModel = RequestModel;

    function Ajax() {
        var self = this;
        self.XHR = [];
        self.ResultURL = [];
        self.EnableBeforeExit = true;

        self.Initial = function () {
            jQuery(document).ajaxSend(function (event, jqxhr, settings) {
                // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
                ValidationRequestService.setSecurityHeader(jqxhr);
                jqxhr.setRequestHeader('Accept-Language', '');
                jqxhr.settings = settings;
                self.XHR.push(jqxhr);
            })
                .ajaxComplete(function (e, jqxhr) {
                    self.XHR = jQuery.grep(self.XHR, function (xhr) { return xhr !== jqxhr; });
                });
        };

        self.ExecuteBeforeExit = function (additionalRequests, useBeacon) {
            if (!self.EnableBeforeExit) {
                setTimeout(function () {
                    self.EnableBeforeExit = true;
                }, 100);

                return;
            }

            var data = WC.Utility.ToArray(additionalRequests);

            // create model for results/x
            var resultUrls = self.GetLongRunUrls();
            jQuery.merge(resultUrls, self.ResultURL);
            self.ResultURL = [];
            jQuery.merge(data, self.GetAbortingRequestsData(resultUrls));

            // send request to server side
            self.SendExitRequests(data, useBeacon);
        };

        self.GetAbortingRequestsData = function (urls) {
            var data = [];
            jQuery.each(urls.distinct(), function (index, resultUrl) {
                data.push(new RequestModel(RequestModel.METHOD.DELETE, resultUrl));
            });
            return data;
        };

        self.SendExitRequests = function (data, useBeacon) {
            if (!data.length)
                return;

            var url = WC.HtmlHelper.GetInternalUri('exit', 'page');
            if (Modernizr.sendbeacon && useBeacon)
                self.SendBeacon(url, JSON.stringify(data));
            else
                CreateDataToWebService(url, JSON.stringify(data), true, false);
        };

        self.SendBeacon = function (url, data) {
            navigator.sendBeacon(url, data);
        };

        self.AbortAll = function () {
            self.AbortLongRunningRequest();
            jQuery.each(self.XHR, function (idx, xhr) {
                xhr.abort();
            });
            jQuery.active = 0;
            self.XHR = [];
        };

        self.IsResultUrl = function (url, type) {
            return type === 'GET' && /results\/\d+$/.test(url);
        };

        self.GetLongRunUrls = function () {
            var data = [];
            jQuery.each(self.XHR, function (index, xhr) {
                // #1. results/x
                if (xhr.settings && self.IsResultUrl(xhr.settings.url, xhr.settings.type)) {
                    data.push(xhr.settings.url.replace(rootWebsitePath + 'api/proxy', ''));
                }
            });
            return data;
        };

        self.AbortLongRunningRequest = function () {
            var data = self.GetAbortingRequestsData(self.GetLongRunUrls());
            self.SendExitRequests(data, true);
        };

        self.Request = function (url, type, data, options) {
            // store request url
            if (self.IsResultUrl(url, type)) {
                self.ResultURL.push(url.replace(rootWebsitePath + 'api/proxy', ''));
            }

            if (type !== 'GET' && data && typeof data === 'object') {
                data = JSON.stringify(data);
            }
            if (options && typeof options === 'object' && typeof options.async !== 'boolean') {
                delete options.async;
            }

            var ajaxOptions = jQuery.extend({
                url: url,
                type: type,
                data: data,
                async: true,
                contentType: 'application/json; charset=utf-8',
                timeout: Math.max(ajaxTimeoutExpirationInSeconds, 1) * 1000
            }, options);

            return jQuery.ajax(ajaxOptions);
        };
        self.BuildRequestUrl = function (originalUrl, isLocalApi) {
            originalUrl = originalUrl || '';
            if (originalUrl.charAt(0) === '/') {
                originalUrl = originalUrl.substr(1);
            }

            if (isLocalApi) {
                if (originalUrl.substr(0, rootWebsitePath.length - 1) === rootWebsitePath.substr(1)) {
                    return '/' + originalUrl;
                }
                else {
                    return rootWebsitePath + originalUrl;
                }
            }
            else if (originalUrl.toLowerCase() === 'sessions') {
                return rootWebsitePath + 'api/session/';
            }
            else {
                return rootWebsitePath + 'api/proxy/' + originalUrl.replace('//', '/');
            }
        };

        self.Initial();
    }

    window.WC.Ajax = helper || new Ajax();

})(window, WC.Ajax);

(function (window) {
    "use strict";

    window.GetDataFromWebService = function (originalUrl, data, isLocalApi, async, timeout) {
        var url = WC.Ajax.BuildRequestUrl(originalUrl, isLocalApi);
        return WC.Ajax.Request(url, 'GET', data, {
            async: async,
            timeout: timeout
        });
    };

    window.UpdateDataToWebService = function (originalUrl, data, isLocalApi, async, timeout) {
        var url = WC.Ajax.BuildRequestUrl(originalUrl, isLocalApi);
        return WC.Ajax.Request(url, 'PUT', data, {
            async: async,
            timeout: timeout
        });
    };

    window.CreateDataToWebService = function (originalUrl, data, isLocalApi, async, timeout) {
        var url = WC.Ajax.BuildRequestUrl(originalUrl, isLocalApi);
        return WC.Ajax.Request(url, 'POST', data, {
            async: async,
            timeout: timeout
        });
    };

    window.DeleteDataToWebService = function (originalUrl, data, isLocalApi, async, timeout) {
        var url = WC.Ajax.BuildRequestUrl(originalUrl, isLocalApi);
        return WC.Ajax.Request(url, 'DELETE', data, {
            async: async,
            timeout: timeout
        });
    };

    window.PostAjaxHtmlResult = function (originalUrl, data, async, timeout) {
        return CreateDataToWebService(originalUrl, data, true, async, timeout);
    };

    window.GetAjaxHtmlResult = function (originalUrl, data, async, timeout) {
        return GetDataFromWebService(originalUrl, data, true, async, timeout);
    };

    window.RefreshPageView = function (originalUrl) {
        var url = WC.Ajax.BuildRequestUrl(originalUrl, true);
        return WC.Ajax.Request(url, 'GET', null, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    };

})(window);
