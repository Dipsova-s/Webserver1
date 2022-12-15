(function (win) {

    var getUrlFromMetadata = function (metadata) {
        var url;
        if (typeof metadata.url === 'undefined')
            url = jQuery(metadata.element).attr('href') || '#';
        else
            url = metadata.url || '';

        // lower url if not call to getmodelfield
        if (url.indexOf('/role/getmodelfield') === -1)
            url = url.toLowerCase();

        return url;
    };

    var ajax = {
        timeout: 150000,
        lastMainContentRequest: null,
        isReloadMainContent: false,
        pageUploadEvents: {},
        xhr: [],
        reloadMainContent: function () {
            var self = this;
            self.isReloadMainContent = true;
            if (self.lastMainContentRequest !== null) {
                MC.form.page.clear();
                MC.form.page.collectStates();

                return jQuery.when(self.request(self.lastMainContentRequest));
            }
            else {
                return null;
            }
        },
        init: function () {
            // set ajax request timeout to 1min
            var self = this;
            var defaultSettings = {
                timeout: MC.ajax.timeout,
                dataFilter: function (data) {
                    // prevent json parse error if no data
                    if ($.inArray('json', this.dataTypes) !== -1 && data === '') {
                        data = null;
                    }
                    return data;
                }
            };
            // disable cache for IE
            if (jQuery.browser.msie)
                defaultSettings.cache = false;
            jQuery.ajaxSetup(defaultSettings);

            // handle ajax request
            jQuery(document).ajaxStart(function () {
                MC.ui.loading.show();
            })
                .ajaxSend(function (e, xhr) {
                    if (xhr && xhr.setRequestHeader) {
                        xhr.setRequestHeader('Accept-Language', '');
                        ValidationRequestService.setSecurityHeader(xhr);
                    }
                })
                .ajaxError(self.onAjaxError)
                .ajaxSuccess(function () {
                    MC.ajaxDone();
                })
                .ajaxStop(function () {
                    if (MC.ui.loading.type === MC.ui.loading.TYPE.normal)
                        MC.ui.loading.hide();
                })
                .ajaxComplete(function (e, jqxhr) {
                    MC.ajax.xhr = jQuery.grep(MC.ajax.xhr, function (xhr) {
                        return xhr !== jqxhr;
                    });

                    setTimeout(function () {
                        MC.ui.loading.type = MC.ui.loading.TYPE.normal;
                    }, 3000);
                });
        },
        onAjaxError: function (e, xhr, settings, error) {
            if (typeof error === 'string' && error.toLowerCase().indexOf('timeout') !== -1) {
                error = Localization.MC_Ajax_RequestTimeout;
                xhr.status = 408;
                xhr.responseText = JSON.stringify({
                    reason: error,
                    message: Localization.HTTP_408_Timeout
                });
            }

            if (xhr.status === 401 || xhr.status === 440) {
                MC.util.reload();
                return;
            }

            if (xhr.status === 0 || xhr.__disable_error === true) {
                if (xhr.readyState === 0 && xhr.statusText != "abort") {
                    MC.util.reload();
                }
                return;
            }

            if (typeof settings.error === "function" && settings.url.includes(notificationsFeed.dataUrl)) {
                return;
            }

            var errorMessage = MC.ajax.getErrorMessage(xhr, settings, error);

            MC.ui.loading.setError(errorMessage);
        },
        clearAllKendoUI: function (container) {
            jQuery(container).find('[data-role]').each(function (index, ui) {
                var kendoUI = jQuery(ui).data('handler');
                if (kendoUI && kendoUI.destroy && !kendoUI.element.hasClass('global'))
                    kendoUI.destroy();
            });
        },
        registerPageUnloadEvent: function (name, fn) {
            MC.ajax.pageUploadEvents[name] = fn;
        },
        onPageUnload: function (lastUrl, currentUrl) {
            // clear something on leave a page
            jQuery.each(MC.ajax.pageUploadEvents, function (name, fn) {
                fn.call(MC.ajax, lastUrl, currentUrl);
            });
        },
        request: function (options) {
            var metadata = typeof options === 'undefined' ? {} : jQuery.extend(true, {
                type: 'get'
            }, options, jQuery(options.element).data() || {});

            if (metadata.target === '#mainContent') {
                // clear something on leave a page
                if (metadata.type === 'get' && MC.ajax.lastMainContentRequest) {
                    var lasturl = MC.ajax.lastMainContentRequest.url.toLowerCase();
                    var currentUrl = getUrlFromMetadata(metadata);
                    MC.ajax.onPageUnload(lasturl, currentUrl);
                }

                // scroll to top
                window.scrollTo(1, 0);

                // clean kendo ui
                MC.ajax.clearAllKendoUI('body');
            }

            if (typeof metadata.ajaxStart === 'function')
                metadata.ajaxStart(metadata);


            var url = getUrlFromMetadata(metadata);
            if (!url) {
                MC.util.showPopupAlert(Localization.MC_Ajax_ControllerUndefined);
                return jQuery.when();
            }
            else {
                var xhr = jQuery.ajax({
                    url: url,
                    data: metadata.parameters || {},
                    type: metadata.type,
                    xhrFields: typeof metadata.xhrFields === 'undefined' ? {} : metadata.xhrFields,
                    timeout: metadata.timeout,
                    success: function (data, status, xhr) {
                        if (typeof data === 'string' && (data.indexOf('id="LoginForm"') !== -1 || data.indexOf('class="login-page"') !== -1)) {
                            location.reload();
                            return;
                        }
                        else {
                            if (metadata.target === '#mainContent' && metadata.type === 'get')
                                MC.ajax.lastMainContentRequest = metadata;

                            jQuery(metadata.target).empty().html(data);

                            if (typeof metadata.ajaxSuccess === 'function')
                                metadata.ajaxSuccess(metadata, data, status, xhr);
                        }
                    }
                });

                xhr.skipAbort = metadata.skipAbort;
                this.xhr.push(xhr);
                return xhr;
            }
        },
        abortAll: function () {
            jQuery.each(this.xhr, function (idx, xhr) {
                if (!xhr.skipAbort)
                    xhr.abort();
            });
            this.xhr = [];
        },
        setErrorDisable: function (xhr, status, error, deferred) {
            xhr.__disable_error = true;
            if (deferred) {
                deferred.resolve(xhr, status, error);
            }
        },
        getErrorMessage: function (xhr, settings, error) {
            var message = '';
            try {
                var data = MC.ajax.getErrorData(xhr, error);

                if (!data.reason || xhr.status === 500) {
                    data.reason = Captions.Generic_Error_Message;
                    message += MC.messages.getMessage(data.reason);
                }
                else {
                    if (data.reason && data.reason !== error) {
                        message = data.reason + ', ';
                    }
                    message += MC.messages.getMessage(data.message);
                }

                if (settings && settings.url) {
                    message += '<br /><br /><i>' + (settings.type || 'unknown').toUpperCase() + ' ' + unescape(settings.url) + '</i>';
                }
            }
            catch (e) {
                if (settings && settings.url)
                    message += (settings.type || 'unknown').toUpperCase() + ' ' + unescape(settings.url);
            }
            return MC.ajax.getErrorMessageFromTemplate(xhr.status, error, data.reason, message);
        },
        getErrorData: function (xhr, error) {
            var data = {};
            if (xhr.responseText) {
                try {
                    data = jQuery.parseJSON(xhr.responseText);
                }
                catch (e) {
                    var responseHtml = jQuery(xhr.responseText);
                    data = {
                        reason: responseHtml.find('h1:first').text(),
                        message: responseHtml.find('h2:first').text()
                    };
                }
            }
            else {
                data = {
                    reason: error,
                    message: error
                };
            }
            return data;
        },
        getErrorMessageFromTemplate: function (status, error, reason, message) {
            var template = '<h1>{code}: {title}</h1><p>{message}</p>';
            if (status)
                template = template.replace('{code}', status);
            else
                template = template.replace('{code}: ', '');
            template = template.replace('{title}', error || reason);
            template = template.replace('{message}', message);
            return template;
        }
    };

    win.MC.ajax = ajax;
    win.MC.ajax.init();

})(window);
