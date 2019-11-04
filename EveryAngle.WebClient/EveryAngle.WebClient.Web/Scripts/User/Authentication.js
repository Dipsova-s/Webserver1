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
    window.UserLogin = function (username, password, isModalPopup) {
        _self.HideErrorMessage();

        if (!self.IsBrowserSupport()) {

            _self.ShowErrorMessage(privateBrowsingInSafariIsNotSupported);
            _self.SetControlFocus();
            return;
        }

        if (!self.Authenticate(username, password, isModalPopup)) {

            _self.ShowErrorMessage(requireUserNameAndPasword);
            _self.SetControlFocus();
        }
    };  

    window.CancelToLoginPage = function () {
        ClearCookies(rootWebsitePath);
        window.location = loginPageUrl;
    };

    self.InitialLoginPage = function () {
        // Set focus to username textbox after page load
        if (jQuery('#UserName').length) {
            _self.InitialUrlAndUI();

            // force browser ask for saving the form
            var loginForm = jQuery('#LoginForm');
            if (loginForm.length) {
                _self.InitialLoginForm(loginForm);
            }
        }
        
        if (self.IsiPadOS13()) {
            _self.ShowWarningMessage(scrollingMightNotWorkCorrectlyWhenRunningIOS13);
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

                window.UserLogin(usernameElement.val(), passwordElement.val(), false);
            });

        jQuery('#oldPassword, #newPassword, #ComparedPassword')
            .off('keypress')
            .on('keypress', function (event) {
                if (event.which === 13)
                    self.SubmitChangePassword();
            });

        jQuery('#ChangePasswordButton')
            .off('click')
            .on('click', self.SubmitChangePassword);
    };
    _self.CleanupAuthorizedData = function () {
        // cleanup old cookies
        DeleteCookie('EASECTOKEN', '/');
        DeleteCookie('EASECTOKEN', rootWebsitePath);

        return jQuery.when(
            !_self.isSessionCleared && window.mcClearSessionUrl ? GetAjaxHtmlResult(window.mcClearSessionUrl) : null,
            !_self.isSessionCleared ? GetAjaxHtmlResult(window.wcClearSessionUrl) : null)
            .done(function () {
                _self.isSessionCleared = true;
            });
    };

    self.ShowLoginPopup = function () {
        DeleteCookie('EASECTOKEN', rootWebsitePath);
        if (requestHistoryModel.ClearPopupBeforeExecute) {
            if (popup.Current) {
                popup.Current.destroy();
            }
            popup.CloseAll();
        }

        var userData = jQuery.localStorage('currentuser');
        var popupName = 'LoginPopup';
        var popupSettings = {
            element: '#popup' + popupName,
            content: WC.HtmlHelper.GetInternalUri('login', 'user', { popup: true }),
            className: 'popup' + popupName,
            actions: [],
            buttons: null,
            resizable: false,
            refresh: function (e) {
                e.sender.toFront();

                self.ClearAuthorizedData(false);

                jQuery('#CancelButton').show();
                if (userData === 'undefined') {
                    jQuery('#UserName').val('').prop('disabled', false);
                }
                else {
                    jQuery('#UserName').val(userData).prop('disabled', true);
                }
                setTimeout(function () {
                    jQuery('#Password, #LoginButton').prop('disabled', false);
                }, 500);

                jQuery('.SessonExpiredDetail').text('Requests cancelled because of session expired');
            },
            open: function (e) {
                if (e.sender.isPopupInitialized) {
                    jQuery('#Password').val('');
                    jQuery('#ErrorMessage').removeClass('info').text('').show();

                    setTimeout(function () {
                        jQuery('#Password, #LoginButton').prop('disabled', false);
                    }, 500);
                }
            }
        };

        var win = popup.Show(popupSettings);
        if (win) {
            win.toFront();
        }
    };

    self.CloseLoginPopup = function () {
        popup.Close('#popupLoginPopup');
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

    self.Authenticate = function (username, password, isModalPopup) {
        if (!isModalPopup) {
            jQuery.localStorage('loginfailcount', 0);

            jQuery.removeCookie('EAAuthentication', { 'path': searchPageUrl });
            jQuery.removeCookie('EAAuthentication', { 'path': anglePageUrl });
            jQuery.removeCookie('EAAuthentication', { 'path': dashboardPageUrl });
            jQuery.removeCookie('EAAuthentication', { 'path': rootWebsitePath });
            jQuery.removeCookie('EAAuthentication', { 'path': '/' });
        }

        username = jQuery.trim(username);
        password = jQuery.trim(password);

        if (username && password) {
            var loginDeferred = jQuery.Deferred();
            loginDeferred.fail(function (xhr, status, error) {
                if (xhr.responseJSON && xhr.responseJSON.password_expired) {
                    _self.HandlePasswordExpired(true, xhr.responseJSON.message);
                }
                else {
                    _self.ShowErrorMessage(xhr, status, error);
                }
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
                        //count login fail
                        if (isModalPopup) {
                            var loginfailcount = parseInt(jQuery.localStorage('loginfailcount'));
                            if (isNaN(loginfailcount))
                                loginfailcount = 0;
                            loginfailcount++;

                            if (loginfailcount >= 3) {
                                ClearCookies(rootWebsitePath);
                                window.location = loginPageUrl;
                            }
                            else {
                                jQuery.localStorage('loginfailcount', loginfailcount);
                            }
                        }
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
                    .then(function (data) {
                        return self.LoadAllResources(mainDeferred, data);
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
                        _self.RedirectToView(mainDeferred, redirectUrl, isModalPopup);
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
    self.LoadAllResources = function (mainDeferred, data) {
        // login success then get versions
        return _self.LoadPart1(mainDeferred, data)

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

        // keep session uri in localStorage
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
    _self.RedirectToView = function (mainDeferred, redirectUrl, isModalPopup) {
        if (redirectUrl) {
            mainDeferred.notify('Redirecting...');
            mainDeferred.resolve(redirectUrl);
        }
        else if (isModalPopup) {
            requestHistoryModel.Execute();
        }
    };

    self.Logout = function () {
        if (typeof directoryHandler === 'undefined')
            return;

        progressbarModel.ShowStartProgressBar();
        progressbarModel.SetDisableProgressBar();
        setTimeout(function () {
            var clientSettingsRequest = userSettingModel.GetClientSettingsData();
            WC.Ajax.ExecuteBeforeExit(clientSettingsRequest ? [clientSettingsRequest] : [], false);
            jQuery('html').addClass('noPopup');

            WC.Ajax.EnableBeforeExit = false;
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

    self.ChangePassword = function (username, oldpassword, newpassword) {

        username = jQuery.trim(username);
        oldpassword = jQuery.trim(oldpassword);

        if (username && oldpassword && newpassword) {
            var changePasswordDeferred = jQuery.Deferred();
            changePasswordDeferred.fail(function (xhr, status, error) {
                _self.ShowErrorMessage(xhr, status, error);
                jQuery('#UserName').attr('disabled', true);
            });

            changePasswordDeferred.done(function () {
                jQuery('#ErrorMessage').removeClass('info').addClass('success').text(changePasswordSuccessful);
                setTimeout(function () {
                    _self.HandlePasswordExpired(false);
                }, 1000);


            });
            changePasswordDeferred.progress(function (status) {
                jQuery('#ErrorMessage').text(status);
            });
            changePasswordDeferred.promise();

            errorHandlerModel.Enable(false);

            var newPasswordContent = { 'user': username, 'oldpassword': oldpassword, 'newpassword': newpassword };
            var changePasswordUrl = 'password/changepassword';

            jQuery('#ErrorMessage').text('');
            changePasswordDeferred.notify(changingPassword);

            UpdateDataToWebService(changePasswordUrl, newPasswordContent)
                .fail(changePasswordDeferred.reject)
                .done(function () {
                    changePasswordDeferred.resolve();
                });

            jQuery('#ErrorMessage').addClass('info').show();
            jQuery('#UserName, #Password, #LoginButton').prop('disabled', true);

            return true;
        }
        else {
            return false;
        }
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

    self.SubmitChangePassword = function () {
        var usernameElement = jQuery('#UserName');
        var oldPasswordElement = jQuery('#oldPassword');
        var newPasswordElement = jQuery('#newPassword');
        var comparedPasswordElement = jQuery('#ComparedPassword');
        if (jQuery.trim(usernameElement.val()) === '' || jQuery.trim(oldPasswordElement.val()) === '' || jQuery.trim(newPasswordElement.val()) === '' || jQuery.trim(comparedPasswordElement.val()) === '') {
            jQuery('#ErrorMessage').show().removeClass('info').text(pleaseEnterYourPasswords);
        }
        else if (jQuery.trim(newPasswordElement.val()) !== jQuery.trim(comparedPasswordElement.val())) {
            jQuery('#ErrorMessage').show().removeClass('info').text(passwordDoesNotMatch);
        }
        else {
            self.ChangePassword(usernameElement.val(), oldPasswordElement.val(), newPasswordElement.val());
        }
    };

    _self.HandlePasswordExpired = function (isChangePassword, errorMessage) {
        jQuery('#ErrorMessage').removeClass('info success').text('');
        if (isChangePassword) {
            jQuery('#UserName,#LoginButton').attr('disabled', true);
            jQuery('#ErrorMessage').hide().removeClass('info').text(errorMessage);
            jQuery('#oldPassword,#newPassword,#ComparedPassword').val('');

            jQuery('#CancelButtonPassword').off('click').on('click', function () {
                _self.HandlePasswordExpired(false);
            });
            jQuery('#LoginContainer').addClass('scene scene1');
            setTimeout(function () {
                jQuery('#LoginContainer').addClass('scene2');
                jQuery('#ErrorMessage').show();
            }, 100);
            setTimeout(function () {
                jQuery('#LoginContainer').addClass('ChangePasswordContainer').removeClass('scene scene1 scene2');
            }, 200);
        }
        else {
            jQuery('#UserName,#Password,#LoginButton').attr('disabled', false);
            jQuery('#LoginContainer').addClass('scene scene3');
            jQuery('#Password').val('');

            setTimeout(function () {
                jQuery('#LoginContainer').addClass('scene4').removeClass('ChangePasswordContainer');
            }, 100);
            setTimeout(function () {
                jQuery('#LoginContainer').removeClass('scene scene3 scene4');
            }, 200);
        }
    };
};

window.WC.Authentication = new Authentication();
jQuery(function () {
    window.WC.Authentication.InitialLoginPage();
});