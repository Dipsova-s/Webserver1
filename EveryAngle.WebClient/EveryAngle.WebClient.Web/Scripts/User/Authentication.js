function Authentication() {
    "use strict";

    var self = this;
    var _self = {};

    _self.redirectToMC = false;
    _self.redirectToWC = false;
    _self.isSessionCleared = false;
    _self.fnCheckResourcesLoaded = null;

    // use for pages execpt login
    if (typeof window.isResourcesLoaded === 'undefined') {
        window.isResourcesLoaded = true;
    }

    // assign to global
    window.UserLogin = function (username, password) {
        _self.HideErrorMessage();

        if (!self.IsBrowserSupport()) {

            _self.ShowErrorMessage(privateBrowsingInSafariIsNotSupported);
            _self.SetControlFocus();
            return;
        }

        if (!self.Authenticate(username, password)) {

            _self.ShowErrorMessage(requireUserNameAndPasword);
            _self.SetControlFocus();
        }
    };  

    window.CancelToLoginPage = function () {
        ClearCookies(rootWebsitePath);
        window.location = loginPageUrl;
    };

    // handle new logins from STS
    self.CheckForNewLogin = function() {
        if (window.GetCookie('NewLogin', false) === 'true') {
            window.DeleteCookie('NewLogin', '/');

            var mainDeferred = jQuery.Deferred();
            self.LoadAllResources(mainDeferred);
        }
    }

    self.InitialLoginPage = function () {
        // Set focus to username textbox after page load
        if (jQuery('#UserName').length) {
            _self.InitialUrlAndUI();

            // force browser ask for saving the form
            var loginForm = jQuery('#LoginForm');
            if (loginForm.length) {
                _self.InitialLoginForm(loginForm);

                // detected the iPad OS 13 while showing the login page 
                if (self.IsiPadOS13()) {
                    _self.ShowWarningMessage(scrollingMightNotWorkCorrectlyWhenRunningIOS13);
                }
            }
        }
    };
    _self.InitialUrlAndUI = function () {
        if (!jQuery.trim(jQuery('#UserName').val()))
            jQuery('#UserName').focus();
        jQuery('#UserName, #Password, #LoginButton').prop('disabled', false);
        _self.HideErrorMessage();

        if (location.hash)
            location.href = location.hash.replace(/%20/ig, ' ');
    };
    _self.InitialLoginForm = function (loginForm) {
        var usernameElement = jQuery('#UserName');
        var passwordElement = jQuery('#Password');

        jQuery('<iframe id="frame" name="frame" />').css({
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0
        }).prependTo('body');

        jQuery('#UserName, #Password')
            .off('keypress')
            .on('keypress', function (event) {
                if (event.which === 13)
                    loginForm.submit();
            });

        jQuery('#LoginButton')
            .removeAttr('onclick')
            .off('click')
            .on('click', function () {
                loginForm.submit();
            });

        loginForm
            .attr({
                'action': window.loginProcessUrl,
                'target': 'frame'
            })
            .on('submit', loginForm, function (event) {
                WC.Authentication.ClearAuthorizedData(false);
                var form = this;

                event.preventDefault();
                event.stopPropagation();

                if (form.submitted)
                    return;

                form.submitted = true;

                window.UserLogin(usernameElement.val(), passwordElement.val());
            });
    };
    _self.CleanupAuthorizedData = function () {
        // cleanup old cookies
        DeleteCookie('STSEASECTOKEN', '/');
        DeleteCookie('STSEASECTOKEN', rootWebsitePath);

        return jQuery.when(
            !_self.isSessionCleared && window.mcClearSessionUrl ? GetAjaxHtmlResult(window.mcClearSessionUrl) : null,
            !_self.isSessionCleared ? GetAjaxHtmlResult(window.wcClearSessionUrl) : null)
            .done(function () {
                _self.isSessionCleared = true;
            });
    };

    self.IsBrowserSupport = function () {
        return Modernizr.localstorage;
    };

    self.GetNavigatorInfo = function () {
        return {
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints
        };
    };

    self.IsiPadOS13 = function () {
        var navigatorInfo = self.GetNavigatorInfo();
        return navigatorInfo.platform === 'MacIntel' && navigatorInfo.maxTouchPoints > 1;
    };

    self.Authenticate = function (username, password) {
        jQuery.localStorage('loginfailcount', 0);
        jQuery.removeCookie('EAAuthentication', { 'path': searchPageUrl });
        jQuery.removeCookie('EAAuthentication', { 'path': anglePageUrl });
        jQuery.removeCookie('EAAuthentication', { 'path': dashboardPageUrl });
        jQuery.removeCookie('EAAuthentication', { 'path': rootWebsitePath });
        jQuery.removeCookie('EAAuthentication', { 'path': '/' });

        username = jQuery.trim(username);
        password = jQuery.trim(password);

        if (username && password) {
            var loginDeferred = jQuery.Deferred();
            loginDeferred.fail(function (xhr, status, error) {
                _self.ShowErrorMessage(xhr, status, error);
            });
            loginDeferred.done(function (redirectUrl) {
                if (redirectUrl) {
                    setTimeout(function () {
                        window.location = redirectUrl;
                    }, 50);

                    if (jQuery('#LoginForm').length) {
                        var form = jQuery('#LoginForm').get(0);
                        form.submitted = false;
                        form.submit();
                    }
                }
            });
            loginDeferred.progress(function (status) {
                jQuery('#ErrorMessage').html([
                    '<div class="login-progress">',
                        '<div class="loader-spinner-inline"></div>',
                        '<span>' + status + '</span>',
                    '</div>'
                ].join(''));
            });
            loginDeferred.promise();

            var checkCredential = function (mainDeferred) {
                var encodedPassword = { 'authorization': $.base64.encode(username + ":" + password) };
                var loginUrl = 'sessions';
                var deferred = jQuery.Deferred();

                mainDeferred.notify('Checking username and password');
                _self.CleanupAuthorizedData()
                    .then(function () {
                        return CreateDataToWebService(loginUrl, encodedPassword);
                    })
                    .fail(function (xhr, status, error) {
                        mainDeferred.notify('');
                        deferred.reject(xhr, status, error);

                    })
                    .done(function (data) {
                        jQuery.localStorage('loginfailcount', 0);

                        /*
                        # Check session model privileges
                        1. Get current session from application server
                        2. After got success use session.model_privileges to get session model privileges from application server
                        3. Extened the success response into sessionModel.Data
                        4. Check session model privileges by
                            4.1 If model_privileges.access_data_via_webclient of all models are false and session.system_privileges.manage_system is false
                                Show message to user that they hadn't authrozation to use web client
                            4.2 If model_privileges.access_data_via_webclient of one model is true and session.system_privileges.manage_system is whatever
                                User can login to web client
                            4.3 If model_privileges.access_data_via_webclient of all models are false and session.system_privileges.manage_system is true
                                Redirect user to MC
                        */
                        jQuery.localStorage.removeItem(sessionModel.DirectoryName);
                        sessionModel.SetData(null);
                        sessionModel.IsLoaded(false);

                        mainDeferred.notify('Checking user privileges');

                        jQuery.when(sessionModel.Load({ RequestUri: data.uri }))
                            .then(function (response) {
                                jQuery.extend(data, response);
                                sessionModel.SetData(data);

                                return _self.CheckSessionPrivileges();
                            })
                            .fail(deferred.reject)
                            .done(function () {
                                deferred.resolve(data);
                            });
                    });

                return deferred.promise();
            };

            var login = function (mainDeferred) {
                errorHandlerModel.Enable(false);

                jQuery('#ErrorMessage').addClass('info').show();
                jQuery('#UserName, #Password, #LoginButton').prop('disabled', true);

                // check user credential
                checkCredential(mainDeferred)

                    // load all resources
                    .then(function () {
                        return self.LoadAllResources(mainDeferred);
                    })

                    // check redirect url
                    .then(_self.GetRedirectUrl)

                    // pre-load page
                    .then(function (redirectUrl) {
                        return _self.PreloadViews(mainDeferred, redirectUrl);
                    })

                    // on fail
                    .fail(mainDeferred.reject)

                    // on done
                    .done(function (redirectUrl) {
                        _self.RedirectToView(mainDeferred, redirectUrl);
                    });
            };

            clearInterval(_self.fnCheckResourcesLoaded);
            _self.fnCheckResourcesLoaded = setInterval(function () {
                loginDeferred.notify('Initializing...');
                if (window.isResourcesLoaded) {
                    clearInterval(_self.fnCheckResourcesLoaded);

                    login(loginDeferred);
                }
            }, 10);

            return true;
        }
        else {
            return false;
        }
    };
    self.LoadAllResources = function (mainDeferred) {
        // clear data from previous session
        _self.CleanupAuthorizedData();
        self.ClearUserStorage();
        jQuery.localStorage('loginfailcount', 0);
        jQuery.localStorage.removeItem(sessionModel.DirectoryName);
        sessionModel.SetData(null);
        sessionModel.IsLoaded(false);

        // login success then get versions
        return _self.LoadPart1(mainDeferred)

            // load user
            .then(function (data) {
                return _self.LoadPart2(mainDeferred, data);
            })

            // load others
            .then(function () {
                return _self.LoadPart3(mainDeferred);
            })

            // load models
            .then(modelsHandler.LoadModelsInfo);
    };
    _self.LoadPart1 = function (mainDeferred) {
        mainDeferred.notify('Loading system information');
        return directoryHandler.LoadDirectory();
    };
    _self.LoadPart2 = function (mainDeferred, data) {
        mainDeferred.notify('Loading user information');
        jQuery.localStorage('session_uri', data.session);
        return jQuery.when(userModel.Load(), systemSettingHandler.LoadSystemSettings());
    };
    _self.LoadPart3 = function (mainDeferred) {
        mainDeferred.notify('Loading resources');

        jQuery.localStorage('currentuser', jQuery.trim(jQuery('#UserName').val()));
        jQuery.localStorage('firstLogin', 1);

        var part3Deferred = jQuery.Deferred();
        jQuery.when(
            userSettingModel.Load(),
            systemInformationHandler.LoadSystemInformation(),
            modelsHandler.LoadModels(),
            businessProcessesModel.General.Load(),
            fieldCategoryHandler.LoadFieldCategories(),
            internalResourceHandler.LoadResources(),
            systemCurrencyHandler.LoadCurrencies()
        ).always(function () {
            // reject if redirect MC but no access
            var canScheduleAngles = userModel.IsPossibleToScheduleAngles() && systemInformationHandler.IsSupportAngleAutomation();
            var canAccessManagementConsole = userModel.IsPossibleToHaveManagementAccess() || canScheduleAngles;
            if (_self.redirectToMC && !canAccessManagementConsole)
                part3Deferred.reject(_self.GetNoAccessToSystemMessage());
            else
                part3Deferred.resolve();
        });
        return part3Deferred.promise();
    };
    _self.GetRedirectUrl = function () {
        var indexOfRedirect = window.location.href.indexOf('?redirect');
        var redirectUrl = indexOfRedirect !== -1 ? window.location.href.substr(indexOfRedirect).replace('?redirect=', '') : null;

        var indexOfSearchUri = searchPageUrl.toLowerCase().indexOf('/search/');
        var redirectSearchUrl = rootWebsitePath + (userSettingModel.Data().default_language || 'en') + searchPageUrl.substring(indexOfSearchUri);

        var redirectToPage;
        var isUrlRedirectToMC = redirectUrl && redirectUrl.toLowerCase().indexOf('/admin') !== -1;
        if (_self.redirectToWC) {
            if (!redirectUrl || isUrlRedirectToMC) {
                // the url will redirect to MC but no priviledge
                redirectToPage = redirectSearchUrl;
            }
            else {
                // redirect normally
                redirectToPage = redirectUrl;
            }
        }
        else if (_self.redirectToMC) {
            if (isUrlRedirectToMC) {
                // the url will redirect to MC but no priviledge
                redirectToPage = redirectUrl;
            }
            else {
                // redirect normally to MC
                redirectToPage = mcUrl;
            }
        }
        else {
            redirectToPage = redirectUrl || redirectSearchUrl;
        }

        return jQuery.when(redirectToPage);

    };
    _self.PreloadViews = function (mainDeferred, redirectUrl) {
        if (redirectUrl) {
            mainDeferred.notify('Loading views');

            var pageDeferred = [];
            var isRedirectUrlCached = false;
            if (!_self.redirectToMC) {
                jQuery.each([searchPageUrl, anglePageUrl, dashboardPageUrl], function (index, page) {
                    if (redirectUrl.indexOf(page) !== -1) {
                        isRedirectUrlCached = true;
                        pageDeferred.pushDeferred(GetAjaxHtmlResult, [redirectUrl]);
                    }
                    else {
                        pageDeferred.pushDeferred(RefreshPageView, [page]);
                    }
                });
            }

            if (!isRedirectUrlCached) {
                pageDeferred.pushDeferred(RefreshPageView, [redirectUrl]);
            }
            return jQuery.whenAll(pageDeferred, true, true)
                .then(function () {
                    return jQuery.when(redirectUrl);
                });
        }
        else {
            return jQuery.when(redirectUrl);
        }
    };
    _self.RedirectToView = function (mainDeferred, redirectUrl) {
        if (redirectUrl) {
            mainDeferred.notify('Redirecting...');
            mainDeferred.resolve(redirectUrl);
        }
    };

    self.Logout = function () {
        if (typeof directoryHandler === 'undefined')
            return;

        progressbarModel.ShowStartProgressBar();
        progressbarModel.SetDisableProgressBar();
        setTimeout(function () {
            var additionalRequests = [];
            var clientSettingsRequest = userSettingModel.GetClientSettingsData();
            if (clientSettingsRequest)
                additionalRequests.push(clientSettingsRequest);
            WC.Ajax.ExecuteBeforeExit(additionalRequests, false);
            jQuery('html').addClass('noPopup');

            WC.Ajax.EnableBeforeExit = false;
            self.ClearAuthorizedData(false);
            window.location = logoutPageUrl;
        }, 500);
    };

    self.ClearAuthorizedData = function (redirect) {
        jQuery.localStorage.removeItem('session_uri');

        if (redirect === false) {
            self.ClearUserStorage();
        }
        else {
            self.ClearUserStorage();
            ClearCookies(rootWebsitePath);
            window.location = loginPageUrl;
        }
    };

    self.ClearUserStorage = function () {
        // remove storage
        jQuery.localStorage.removeAll();

        // clear data
        if (typeof directoryHandler !== 'undefined')
            directoryHandler.Data = {};

        if (typeof userModel !== 'undefined')
            userModel.IsLoaded(false);

        if (typeof userSettingModel !== 'undefined')
            userSettingModel.IsLoaded(false);

        if (typeof privilegesViewModel !== 'undefined')
            privilegesViewModel.IsLoaded(false);

        if (typeof systemInformationHandler !== 'undefined')
            systemInformationHandler.Data = {};

        if (typeof businessProcessesModel !== 'undefined')
            businessProcessesModel.General.IsLoaded(false);

        if (typeof modelsHandler !== 'undefined')
            modelsHandler.Data = {};

    };

    _self.SetControlFocus = function () {
        var usernameElement = jQuery('#UserName');
        if (!jQuery.trim(usernameElement.val())) {
            usernameElement.focus();
        }
        else {
            jQuery('#Password').val('').focus();
        }
    };

    _self.HideErrorMessage = function () {
        var loginForm = jQuery('#LoginForm');
        if (loginForm.length) {
            loginForm.get(0).submitted = false;
        }

        jQuery('#ErrorMessage').text('').hide();
    };

    self.GetErrorMessage = function (xhr, status, error) {
        var errorMessage, xhrHtml;
        if (typeof xhr === 'string') {
            xhrHtml = $('<div/>', { html: xhr }).find('.customTimeout').children('strong');
            errorMessage = xhrHtml.length ? xhrHtml.text() : xhr;
        }
        else if (xhr.responseText) {
            var data = WC.Utility.ParseJSON(xhr.responseText, { reason: error, message: status });
            xhrHtml = jQuery('<div/>', { html: data.message }).find('.customTimeout').children('strong');
            if (xhrHtml.length) {
                errorMessage = xhrHtml.text();
            }
            else {
                errorMessage = data.reason + ': ' + data.message;
            }
        }
        else {
            errorMessage = 'Application server could not be reached';
        }

        return errorMessage;
    };

    _self.ShowErrorMessage = function (xhr, status, error) {
        var errorMessage = self.GetErrorMessage(xhr, status, error);
        if (!jQuery('#popupLoginPopup').length) {
            jQuery('#UserName').prop('disabled', false);
        }
        jQuery('#Password, #LoginButton').prop('disabled', false);
        jQuery('#ErrorMessage').removeClass('info warning').html(errorMessage).show();

        _self.SetControlFocus();
    };

    _self.ShowWarningMessage = function (warningMessage) {
        jQuery('#ErrorMessage').addClass('warning').html(warningMessage).show();
        _self.SetControlFocus();
    };

    _self.CheckSessionPrivileges = function () {
        var privilegeDeferred = jQuery.Deferred();
        jQuery.when(privilegesViewModel.Load(true))
            .done(function () {
                var canLoginWebClient = userModel.IsPossibleToAccessWebClient();
                var canAccessManagementConsole = userModel.IsPossibleToHaveManagementAccess() || userModel.IsPossibleToScheduleAngles();
                if (canLoginWebClient && canAccessManagementConsole) {
                    // do nothing
                }
                else if (canLoginWebClient) {
                    /* M4-11410: Fixed when user can used WC but cannot use MC => redirect to WC */
                    _self.redirectToWC = true;
                }
                else if (canAccessManagementConsole) {
                    // redirect to MC if has_management_access or schedule_angles
                    _self.redirectToMC = true;
                }
                else {
                    self.ClearUserStorage();
                    ClearCookies(rootWebsitePath);

                    privilegeDeferred.reject(_self.GetNoAccessToSystemMessage());
                }

                privilegeDeferred.resolve();
            });
        return privilegeDeferred.promise();
    };
    _self.GetNoAccessToSystemMessage = function () {
        return Localization.DonotHaveWCAndMCAuthrozation || window.userCannotAccess;
    };
};

window.WC.Authentication = new Authentication();
jQuery(function () {
    window.WC.Authentication.InitialLoginPage();
});