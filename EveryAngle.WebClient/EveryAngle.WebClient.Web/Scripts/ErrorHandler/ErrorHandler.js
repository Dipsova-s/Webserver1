var errorHandlerModel = new ErrorHandlerViewModel();

function ErrorHandlerViewModel() {
    "use strict";

    var self = this;
    self.Enable = ko.observable(true);
    self.WebClientTimeoutChecker = null;
    self.WebClientMessage = [];
    self.IsNeedToRedirectToLoginPage = true;
    self.Source = ko.observable(null);
    self.SourceType = {
        'WEBCLIENT': 'Web Client',
        'APPSERVER': 'Application Server',
        'WEBSERVER': 'Web Server'
    };
    self.WEBCLIENT_ERRORTYPE = {
        EVALERROR: { Code: 'EvalError', Text: 'Eval Error', Message: Localization.ErrorCommonMessage },
        RANGEERROR: { Code: 'RangeError', Text: 'Range Error', Message: Localization.ErrorCommonMessage },
        REFERENCEERROR: { Code: 'ReferenceError', Text: 'Reference Error', Message: Localization.ErrorCommonMessage },
        SYNTAXERROR: { Code: 'SyntaxError', Text: 'Syntax Error', Message: Localization.ErrorCommonMessage },
        TYPEERROR: { Code: 'TypeError', Text: 'Type Error', Message: Localization.ErrorCommonMessage },
        URIERROR: { Code: 'URIError', Text: 'URI Error', Message: Localization.ErrorCommonMessage },
        ERROR: { Code: 'Error', Text: 'Error', Message: Localization.ErrorCommonMessage }
    };
    self.WEBCLIENT_ERROR_INFO = '<strong>{where} :</strong><br/>{details}';
    self.OnClickOkErrorCallback = jQuery.noop;
    self.OnClickRetryErrorCallback = jQuery.noop;

    self.SetSource = function (url, isXHR) {
        if (url.indexOf('api/proxy/') !== -1)
            self.Source(self.SourceType.APPSERVER);
        else if (!isXHR)
            self.Source(self.SourceType.WEBCLIENT);
        else
            self.Source(self.SourceType.WEBSERVER);
    };

    self.IsRequiredToRedirectToLoginPage = function (xhr) {
        if (self.IsNeedToRedirectToLoginPage)
            return xhr.status === 401 ||
                xhr.status === 440 ||
                // Missing the token means the user needs to authorize again
                (xhr.status === 403 && self.GetErrorFromResponseText(xhr.responseText) === "Forbidden, Missing CSRF token"); 
        else
            return false;
    };
    self.RedirectToLoginPage = function () {
        WC.Authentication.ClearAuthorizedData(false);
        ClearCookies(rootWebsitePath);
        GetAjaxHtmlResult(logoutPageUrl, null, false);
        window.location = rootWebsitePath + '?redirect=' + location.pathname + location.hash;
    };
    self.IsRequestTimeout = function (status, textStatus) {
        return status === 408 || status === 0 && textStatus !== 'abort';
    };
    self.ShowTimeoutPopup = function (settings) {
        self.Source(null);

        popup.CloseAll();
        popup.Alert(Localization.Info_OperationTimeout, kendo.format(Localization.Info_OperationTimeoutDescription, settings.type, settings.url));
    };
    self.CleanUnusedPopup = function () {
        progressbarModel.EndProgressBar();
        if (jQuery('#popupNotification').is(':visible')) {
            jQuery('#popupNotification').data(enumHandlers.KENDOUITYPE.WINDOW).wrapper.hide();
        }
    };
    self.BuildAjaxError = function (settings, xhr) {
        if (typeof progressbarModel === 'undefined')
            return;

        self.CleanUnusedPopup();
        if (self.IsRequiredToRedirectToLoginPage(xhr)) {
            self.RedirectToLoginPage();
        }
        else {
            self.ShowAjaxErrorPopup(xhr, settings);
        }
    };
    self.BuildCustomAjaxError = function (settings, xhr) {
        self.SetSource(settings.url, !!xhr);
        self.BuildAjaxError(settings, xhr);
    };
    self.ShowAjaxErrorPopup = function (xhr, settings) {
        var error = self.BuildAppServerError(settings, xhr);
        if (error) {
            error.callback();
            if (error.type === 'alert') {
                popup.Alert(error.title, error.message);
            }
            else {
                popup.Error(error.title, error.message);
            }
        }
    };
    self.ShowToastAjaxError = function (xhr, settings, title) {
        self.IgnoreAjaxError(xhr);
        if (self.IsRequiredToRedirectToLoginPage(xhr)) {
            self.RedirectToLoginPage();
            return;
        }

        var error = self.BuildAppServerError(settings, xhr);
        if (error)
            toast.MakeErrorText(error.message, title);
    };

    self.BuildAppServerError = function (settings, xhr) {
        if (self.IsRequestTimeout(xhr.status, xhr.statusText)) {
            return {
                type: 'alert',
                title: Localization.Info_OperationTimeout,
                message: kendo.format(Localization.Info_OperationTimeoutDescription, settings.type, settings.url),
                callback: function () {
                    self.Source(null);
                    popup.CloseAll();
                }
            };
        }

        var errorMessage = xhr.statusText === 'abort'  ? '' : self.GetErrorFromResponseText(xhr.responseText);
        if (errorMessage) {
            var type = 'error';
            var title = xhr.status + ': ' + xhr.statusText;
            if (self.IsActionNotAllowed(xhr.status, settings.url)) {
                type = 'alert';
                title = Localization.Info_ActionNotAllowed;
            }

            var errorTemplate = '';
            errorTemplate += xhr.status === 403 ? Localization.Info_ActionNotAllowedDescription : '{source} says,';
            errorTemplate += '<br />"{message}".';
            if (window.showErrorSourceUri)
                errorTemplate += '<br /> <div class="errorSource"><strong>Request url</strong><br />{type} {url}</div>';
            errorTemplate = errorTemplate.replace('{source}', self.Source())
                                .replace('{message}', errorMessage.replace(/\\n$/i, '').replace(/\\n/ig, '<br />'))
                                .replace('{type}', settings.type.toUpperCase());

            return {
                type: type,
                title: title,
                message: self.ReplaceUrlAsHtmlEntity(errorTemplate, settings.url),
                callback: jQuery.noop
            };
        }

        return null;
    };
    self.IsActionNotAllowed = function (status, url) {
        return status === 403 && !(/\/models\/\d$/).test(url);
    };
    self.GetErrorFromResponseText = function (responseText) {
        var errorMessage = '';
        try {
            var errorObject = responseText && typeof responseText === 'object' ? responseText : JSON.parse(responseText);
            if (typeof errorObject.Message === 'string' && errorObject.Message.charAt(0) === '{') {
                errorObject = jQuery.parseJSON(errorObject.Message);
            }

            if (errorObject.reason)
                errorMessage += errorObject.reason;

            if (errorObject.message)
                errorMessage += (errorMessage ? ', ' : '') + errorObject.message;
        }
        catch (ex) {
            errorMessage = jQuery('<div />').html(responseText).find('h2:first').text();
        }
        return jQuery.trim(errorMessage);
    };
    self.ReplaceUrlAsHtmlEntity = function (errorTemplate, url) {
        // after ws throw an exception when detected a potentially dangerous, use the unescape to get the actual uri value
        // then combine text() to defined it as html entity, then replace to the errorTemplate
        var customErrorUriText = jQuery('<div></div>').text(unescape(url)).html();
        errorTemplate = errorTemplate.replace('{url}', customErrorUriText);
        return errorTemplate;
    };

    self.BuildAppClientError = function (msg, url, line) {
        progressbarModel.EndProgressBar();

        var isCustomError = false;
        var info = '';
        var type = self.GetWebClientErrorType(msg);
        try {
            var error = JSON.parse(msg.substr(msg.indexOf('{')));
            msg = error.message;
            type = error.type;
            info = error.info;
            isCustomError = true;
        }
        catch (exception) {
            // do nothing
        }

        var errorTemplate = '{message}'
                            + '<div class="errorInfo">'
                            + ' <a class="btnErrorInfo"><span class="more">More...</span><span class="less">Less...</span></a>'
                            + ' <span class="info">{info}</span>'
                            + ' <span class="errorSource">{file}:{line}</span>'
                            + '</div>';
        if (!isCustomError) {
            info = msg;
            var errorType = self.GetWebClientErrorType(msg);
            type = 'Unknown error';
            msg = errorType.Message;
        }
        errorTemplate = errorTemplate.replace('{source}', self.Source())
                                    .replace('{message}', msg.replace('Message: ', '').replace(/\\n$/i, '').replace(/\\n/ig, '<br />'))
                                    .replace(/{file}/g, url.substr(url.lastIndexOf('/') + 1))
                                    .replace(/{line}/g, line)
                                    .replace('{info}', info);

        self.WebClientMessage.push(errorTemplate);

        self.ShowAppClientErrorPopup(type, info);
    };
    self.ShowAppClientErrorPopup = function (type, info) {
        clearTimeout(self.WebClientTimeoutChecker);
        self.WebClientTimeoutChecker = setTimeout(function () {
            var text = self.WebClientMessage.distinct().join('<br/>');
            var win = popup.Error(type || 'Error', text, {
                buttons: [
                    {
                        text: Localization.Ok,
                        isPrimary: true,
                        click: function (e) {
                            self.OnClickOkErrorCallback.call(e);
                            e.kendoWindow.close();
                        },
                        position: 'right'
                    }
                ]
            });

            if (win) {
                win.wrapper.find('.btnErrorInfo').click(function () {
                    jQuery(this).parent().toggleClass('show');
                });
                if (!info) {
                    win.wrapper.find('.errorInfo').remove();
                }
            }

            self.WebClientMessage = [];
        }, 200);
    };

    self.GetWebClientErrorType = function (msg) {
        var type = msg.split(':')[0], errorType = self.WEBCLIENT_ERRORTYPE.ERROR;
        if (type) {
            jQuery.each(self.WEBCLIENT_ERRORTYPE, function (key, value) {
                if (type.toLowerCase().indexOf(value.Code.toLowerCase()) !== -1) {
                    errorType = value;
                    return false;
                }
            });
        }
        return errorType;
    };

    self.ShowError = function (url, data) {
        if (!self.Enable() || self.Source() || typeof url === 'undefined' || window.isLoginPage) {
            return;
        }

        self.Enable(true);
        self.SetSource(url, !!data.xhr);

        if (self.Source() === self.SourceType.APPSERVER
            || self.Source() === self.SourceType.WEBSERVER) {
            self.BuildAjaxError(data.settings, data.xhr);
        }
        else if (self.Source() === self.SourceType.WEBCLIENT) {
            self.BuildAppClientError(data.message, url, data.line);
        }
    };

    self.ShowCustomError = function (msg, type, info) {
        jQuery.error(JSON.stringify({
            message: msg,
            type: type || 'Error',
            info: info || ''
        }));
    };
    self.SetErrorInfo = function (where, details) {
        return self.WEBCLIENT_ERROR_INFO.replace('{where}', where).replace('{details}', details);
    };

    self.GetAreaErrorMessage = function (text) {
        var response = WC.Utility.ParseJSON(text, { reason: null, message: text });
        return response.reason ? response.reason + ', ' + response.message : response.message;
    };

    self.GetRetryButtonLabel = function (msg) {
        var sortErrorMessage = Localization.Info_DisplaySortingReachedLimitation.slice(0, -3);
        var retryButtonLabel = msg.indexOf(sortErrorMessage) === 0 ? Localization.ReexecuteWithoutSorting : Localization.Reexecute;
        return retryButtonLabel;
    };

    self.ShowAreaError = function (element, msg, retryFunction) {
        if (!msg) {
            return;
        }
        self.Enable(false);

        var error = jQuery('<div class="areaErrorContainer" />');
        error.append('<div class="areaErrorMessage">' + msg.replace(/\\n$/i, '').replace(/\\n/ig, '<br />') + '</div>');
        if (typeof retryFunction === 'function') {
            error.children('.areaErrorMessage')
                .append('<a class="areaErrorRetryButton">' + self.GetRetryButtonLabel(msg) + '</a>')
                .children('.areaErrorRetryButton')
                .click(function () {
                    jQuery(this).parents('.areaErrorContainer').remove();
                    retryFunction();
                });
        }
        element = jQuery(element);
        element.children('.areaErrorContainer').remove();
        element.append(error);

        setTimeout(function () {
            self.Enable(true);
        }, 1000);
    };

    self.EnableErrorByDelay = function (delay) {
        setTimeout(function () {
            self.Enable(true);
        }, typeof delay === 'number' ? delay : 100);
    };

    self.IgnoreAjaxError = function (xhr) {
        xhr.ignore = true;
    };
    self.TriggerAjaxError = function (xhr, settings, error) {
        jQuery(document).trigger('ajaxError', [xhr, settings, error]);
    };

    // initial
    if (!window.isLoginPage) {
        window.onerror = function (msg, url, line) {
            if ((line instanceof MediaError) === false) {
                self.ShowError(url, { message: msg, line: line });
            }
        };
        jQuery(document).ajaxError(function (e, xhr, settings, error) {
            if (self.IsRequiredToRedirectToLoginPage(xhr)) {
                self.RedirectToLoginPage();
            }
            else if (!settings.crossDomain && !xhr.ignore) {
                if (self.Enable() && error !== 'abort') {
                    jQuery('.k-loading-mask').remove();
                    jQuery('.loader-container,.k-overlay').hide();
                }
                self.ShowError(settings.url, { settings: settings, xhr: xhr });
            }
        });
    }
}